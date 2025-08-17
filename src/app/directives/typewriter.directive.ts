import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

/**
 * Standalone Typewriter directive for Angular 16+ (tested with Angular 20)
 * Features:
 * - Types and backspaces through a list of strings
 * - Loop support, start/back delays, variable speeds with variance
 * - Smart pause on punctuation
 * - Optional cursor with blinking
 * - Shuffle order
 * - Public pause/resume/stop/restart API (exportAs)
 */
@Directive({
	selector: '[appTypewriter]',
	standalone: true,
	exportAs: 'appTypewriter'
})
export class TypewriterDirective implements OnInit, OnDestroy {
	// Content
	@Input() strings: string[] = [];
	@Input() loop = false;
	@Input() shuffle = false;

	// Timing
	@Input() typeSpeed = 70; // ms per char
	@Input() backSpeed = 40; // ms per char when deleting
	@Input() startDelay = 0; // ms before starting
	@Input() backDelay = 1500; // ms before starting to delete

	// UX
	@Input() showCursor = true;
	@Input() cursorChar = '|';
	@Input() smartPunctuationPause = true; // longer pause on ,.;:!?
	@Input() speedVariance = 0.25; // +- variance portion of speed per keystroke

	// Events
	@Output() sequenceComplete = new EventEmitter<void>();
	@Output() loopComplete = new EventEmitter<number>();

	private host: HTMLElement;
	private cursorEl?: HTMLElement;
	private timers: number[] = [];
	private destroyed = false;
	private playing = true;
	private currentStringIdx = 0;
	private currentLoop = 0;

	constructor(private elRef: ElementRef<HTMLElement>, private renderer: Renderer2) {
		this.host = this.elRef.nativeElement;
	}

	ngOnInit(): void {
		// Setup cursor
		if (this.showCursor) {
			this.cursorEl = this.renderer.createElement('span');
			this.renderer.addClass(this.cursorEl, 'typewriter-cursor');
			this.renderer.setStyle(this.cursorEl, 'display', 'inline-block');
			this.renderer.setStyle(this.cursorEl, 'margin-left', '2px');
			this.renderer.setStyle(this.cursorEl, 'opacity', '1');
			this.renderer.setProperty(this.cursorEl, 'textContent', this.cursorChar);
			this.renderer.appendChild(this.host, this.cursorEl);
			// Blink
			const blink = window.setInterval(() => {
				if (!this.cursorEl) return;
				const current = this.cursorEl.style.opacity;
				this.cursorEl.style.opacity = current === '1' ? '0' : '1';
			}, 530);
			this.timers.push(blink);
		}

		// Start sequence
		this.queueTimer(() => this.runSequence(), this.startDelay);
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.playing = false;
		this.clearAllTimers();
	}

	// Public API
	pause(): void { this.playing = false; }
	resume(): void {
		if (this.playing) return;
		this.playing = true;
	}
	stop(): void {
		this.playing = false;
		this.clearAllTimers();
	}
	restart(): void {
		// Fully restart the animation from the beginning
		this.stop();
		this.destroyed = false; // allow to run again
		this.playing = true;
		this.currentLoop = 0;
		this.currentStringIdx = 0;
		this.setHostText('');
		this.runSequence();
	}

	private runSequence(): void {
		if (this.destroyed) return;
		if (!this.strings || this.strings.length === 0) return;

		const order = this.getOrder();
		const step = async () => {
			for (let i = 0; i < order.length; i++) {
				this.currentStringIdx = order[i];
				await this.typeString(this.strings[this.currentStringIdx]);
				await this.delay(this.backDelay);
				await this.backspace();
				if (this.destroyed) return;
			}
			this.sequenceComplete.emit();
			this.currentLoop++;
			this.loopComplete.emit(this.currentLoop);
			if (this.loop && !this.destroyed) {
				this.runSequence();
			}
		};
		step();
	}

	private async typeString(text: string): Promise<void> {
		await this.waitUntilPlaying();
		this.setHostText('');
		for (let i = 0; i < text.length; i++) {
			await this.waitUntilPlaying();
			const ch = text[i];
			this.appendHostText(ch);
			let delay = this.vary(this.typeSpeed);
			if (this.smartPunctuationPause && /[.,;:!?]/.test(ch)) {
				delay += 200; // small extra pause on punctuation
			}
			await this.delay(delay);
			if (this.destroyed) return;
		}
	}

	private async backspace(): Promise<void> {
		const initial = this.getHostText();
		for (let i = initial.length - 1; i >= 0; i--) {
			await this.waitUntilPlaying();
			this.setHostText(initial.substring(0, i));
			await this.delay(this.vary(this.backSpeed));
			if (this.destroyed) return;
		}
	}

	private getOrder(): number[] {
		const idx = Array.from({ length: this.strings.length }, (_, i) => i);
		if (!this.shuffle) return idx;
		// Fisher–Yates shuffle
		for (let i = idx.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[idx[i], idx[j]] = [idx[j], idx[i]];
		}
		return idx;
	}

	private setHostText(value: string): void {
		// Ensure cursor stays last child
		if (this.cursorEl) {
			const textNode = this.ensureTextNodeBeforeCursor();
			textNode.nodeValue = value;
			return;
		}
		this.renderer.setProperty(this.host, 'textContent', value);
	}

	private appendHostText(ch: string): void {
		if (this.cursorEl) {
			const textNode = this.ensureTextNodeBeforeCursor();
			textNode.nodeValue = (textNode.nodeValue ?? '') + ch;
			return;
		}
		this.renderer.setProperty(this.host, 'textContent', (this.host.textContent ?? '') + ch);
	}

	private getHostText(): string {
		if (this.cursorEl) {
			const textNode = this.ensureTextNodeBeforeCursor();
			return textNode.nodeValue ?? '';
		}
		return this.host.textContent ?? '';
	}

	private ensureTextNodeBeforeCursor(): Text {
		const last = this.host.lastChild;
		if (last && last === this.cursorEl) {
			const prev = this.cursorEl!.previousSibling;
			if (prev && prev.nodeType === Node.TEXT_NODE) return prev as Text;
			const textNode = this.renderer.createText('');
			this.renderer.insertBefore(this.host, textNode, this.cursorEl);
			return textNode as Text;
		}
		// No cursor (shouldn't happen here) – return/create text node
		const only = this.host.firstChild;
		if (only && only.nodeType === Node.TEXT_NODE) return only as Text;
		const tn = this.renderer.createText('');
		this.renderer.insertBefore(this.host, tn, this.host.firstChild);
		return tn as Text;
	}

	private vary(base: number): number {
		const variance = Math.max(0, Math.min(1, this.speedVariance));
		const delta = base * variance;
		return Math.max(0, Math.round(base + (Math.random() * 2 - 1) * delta));
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			const id = window.setTimeout(() => resolve(), ms);
			this.timers.push(id);
		});
	}

	private waitUntilPlaying(): Promise<void> {
		if (this.destroyed) return Promise.resolve();
		if (this.playing) return Promise.resolve();
		return new Promise((resolve) => {
			const check = window.setInterval(() => {
				if (this.destroyed) {
					clearInterval(check);
					resolve();
				} else if (this.playing) {
					clearInterval(check);
					resolve();
				}
			}, 50);
			this.timers.push(check);
		});
	}

	private queueTimer(cb: () => void, ms: number): void {
		const id = window.setTimeout(() => cb(), ms);
		this.timers.push(id);
	}

	private clearAllTimers(): void {
		for (const id of this.timers) {
			clearTimeout(id);
			clearInterval(id as unknown as number);
		}
		this.timers = [];
	}
}

