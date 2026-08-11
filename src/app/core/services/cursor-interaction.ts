import { Injectable, signal } from '@angular/core';

export interface CursorInteractionState {
  scale: number;
  magnetX: number;
  magnetY: number;
  attractionStrength: number;
}

const DEFAULT_STATE: CursorInteractionState = {
  scale: 1,
  magnetX: 0,
  magnetY: 0,
  attractionStrength: 0,
};

/**
 * Manages cursor interactions: ring expansion, magnetic attraction, element proximity.
 * Decoupled from rendering to allow GSAP to animate state smoothly.
 */
@Injectable({ providedIn: 'root' })
export class CursorInteraction {
  readonly state = signal<CursorInteractionState>(DEFAULT_STATE);

  private activeElement: Element | null = null;
  private attractionElement: HTMLElement | null = null;

  updateScale(scale: number): void {
    this.setState({ scale });
  }

  setAttraction(element: HTMLElement | null, strength: number = 0): void {
    this.attractionElement = element;
    if (!element) {
      this.setState({ attractionStrength: 0, magnetX: 0, magnetY: 0 });
    } else {
      this.setState({ attractionStrength: strength });
    }
  }

  updateMagnetism(cursorX: number, cursorY: number): void {
    if (!this.attractionElement) return;

    const rect = this.attractionElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - cursorX;
    const dy = centerY - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Magnetic pull radius: elements have different ranges
    const pullRadius = this.getPullRadius(this.attractionElement);

    if (distance < pullRadius) {
      const strength = this.state().attractionStrength;
      const influence = Math.max(0, 1 - distance / pullRadius);
      this.setState({
        magnetX: (dx * influence * strength) / distance || 0,
        magnetY: (dy * influence * strength) / distance || 0,
      });
    } else {
      this.setState({ magnetX: 0, magnetY: 0 });
    }
  }

  private getPullRadius(element: HTMLElement): number {
    if (element.hasAttribute('data-magnetic-strong')) return 180;
    if (element.hasAttribute('data-magnetic')) return 120;
    if (element.tagName === 'A' || element.tagName === 'BUTTON') return 100;
    return 80;
  }

  private setState(partial: Partial<CursorInteractionState>): void {
    this.state.set({ ...this.state(), ...partial });
  }
}
