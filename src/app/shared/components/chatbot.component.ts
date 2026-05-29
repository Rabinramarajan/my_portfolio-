import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface FAQ {
  keywords: string[];
  answer: string;
  quickReplies?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Trigger Button -->
    <button
      class="chat-trigger"
      (click)="toggleChat()"
      [class.active]="isOpen()"
      aria-label="Open chat assistant"
      id="chatbot-trigger-btn"
    >
      @if (!isOpen()) {
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        @if (hasUnread()) {
          <span class="chat-unread-dot"></span>
        }
      } @else {
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      }
    </button>

    <!-- Chat Panel -->
    @if (isOpen()) {
      <div class="chat-panel" role="dialog" aria-label="Chat with Rabin R" aria-modal="false">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-avatar">R</div>
          <div class="chat-header-info">
            <span class="chat-header-name">Rabin R · Assistant</span>
            <span class="chat-header-status">
              <span class="status-dot"></span> Online now
            </span>
          </div>
          <button class="chat-close-btn" (click)="toggleChat()" aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messagesContainer>
          @for (msg of messages(); track msg.id) {
            <div class="chat-message-row" [class.user-row]="msg.type === 'user'">
              @if (msg.type === 'bot') {
                <div class="bot-avatar-sm">R</div>
              }
              <div class="chat-bubble" [class.chat-bubble--user]="msg.type === 'user'" [class.chat-bubble--bot]="msg.type === 'bot'">
                {{ msg.text }}
              </div>
            </div>
            @if (msg.quickReplies && msg.type === 'bot') {
              <div class="quick-replies">
                @for (qr of msg.quickReplies; track qr) {
                  <button class="quick-reply-btn" (click)="sendQuickReply(qr)">{{ qr }}</button>
                }
              </div>
            }
          }

          @if (isTyping()) {
            <div class="chat-message-row">
              <div class="bot-avatar-sm">R</div>
              <div class="chat-bubble chat-bubble--bot typing-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <input
            #inputEl
            type="text"
            class="chat-input"
            [(ngModel)]="userInput"
            (keydown.enter)="sendMessage()"
            placeholder="Ask me anything..."
            maxlength="200"
            id="chatbot-input"
            autocomplete="off"
          />
          <button class="chat-send-btn" (click)="sendMessage()" [disabled]="!userInput.trim()" aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="chat-footer-note">Powered by Rabin's portfolio assistant</div>
      </div>
    }
  `,
  styles: [`
    /* ── Trigger Button ─────────────────────── */
    .chat-trigger {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9998;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(124, 58, 237, 0.45), 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;

      &:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 40px rgba(124, 58, 237, 0.6); }
      &.active { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    }

    .chat-unread-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid #040a14;
      animation: pulse-dot 2s ease infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
      50%       { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    }

    /* ── Chat Panel ─────────────────────────── */
    .chat-panel {
      position: fixed;
      bottom: 94px;
      right: 28px;
      z-index: 9999;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #070e1c;
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
      animation: slideUpPanel 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUpPanel {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Header ─────────────────────────────── */
    .chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }

    .chat-header-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 15px;
      color: white;
      flex-shrink: 0;
    }

    .chat-header-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .chat-header-name {
      font-size: 13px;
      font-weight: 600;
      color: #f0f4ff;
      font-family: 'Inter', sans-serif;
    }

    .chat-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #94a3b8;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
    }

    .chat-close-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
      &:hover { color: #f0f4ff; background: rgba(255,255,255,0.08); }
    }

    /* ── Messages ────────────────────────────── */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
    }

    .chat-message-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;

      &.user-row {
        flex-direction: row-reverse;
      }
    }

    .bot-avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .chat-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
      font-family: 'Inter', sans-serif;

      &--bot {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.08);
        color: #e2e8f0;
        border-bottom-left-radius: 4px;
      }

      &--user {
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }
    }

    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 16px;
      min-width: 56px;
    }

    .typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #94a3b8;
      animation: typingBounce 1.2s ease-in-out infinite;

      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.15s; }
      &:nth-child(3) { animation-delay: 0.3s; }
    }

    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30%            { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Quick Replies ───────────────────────── */
    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 0 0 34px;
    }

    .quick-reply-btn {
      padding: 6px 12px;
      background: rgba(124, 58, 237, 0.12);
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 20px;
      color: #c4b5fd;
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: rgba(124, 58, 237, 0.25);
        border-color: rgba(124, 58, 237, 0.5);
        color: white;
        transform: translateY(-1px);
      }
    }

    /* ── Input Area ──────────────────────────── */
    .chat-input-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      background: rgba(0,0,0,0.2);
    }

    .chat-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 9px 16px;
      font-size: 13px;
      color: #f0f4ff;
      outline: none;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;

      &::placeholder { color: #475569; }
      &:focus {
        border-color: rgba(124, 58, 237, 0.5);
        background: rgba(124, 58, 237, 0.06);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
    }

    .chat-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .chat-footer-note {
      text-align: center;
      font-size: 10.5px;
      color: #334155;
      padding: 6px;
      font-family: 'Inter', sans-serif;
    }

    @media (max-width: 480px) {
      .chat-panel { right: 12px; bottom: 84px; width: calc(100vw - 24px); }
      .chat-trigger { right: 16px; bottom: 20px; }
    }
  `]
})
export class ChatbotComponent implements AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl!: ElementRef<HTMLInputElement>;

  protected isOpen   = signal(false);
  protected isTyping = signal(false);
  protected hasUnread = signal(true);
  protected userInput = '';
  protected messages  = signal<ChatMessage[]>([]);

  private msgIdCounter = 0;

  private readonly faqs: FAQ[] = [
    {
      keywords: ['hi', 'hello', 'hey', 'start', 'sup', 'hii'],
      answer: "👋 Hi there! I'm Rabin's portfolio assistant. I can answer questions about his skills, experience, availability, rates, and how to start a project. What would you like to know?",
      quickReplies: ['💼 What services do you offer?', '⏰ Are you available now?', '📞 Book a call', '💰 What are your rates?']
    },
    {
      keywords: ['service', 'offer', 'do', 'build', 'what', 'help'],
      answer: "Rabin specialises in:\n\n• ⚡ Angular web applications (enterprise portals, dashboards, SPAs)\n• 📱 Ionic cross-platform mobile apps (Android & iOS)\n• 🔧 Node.js REST APIs & backend\n• 🚀 Angular migrations & performance audits\n\nHe's worked with government systems, SaaS platforms, and fintech products.",
      quickReplies: ['📞 Book a discovery call', '⏰ Availability?', '🗂️ See projects']
    },
    {
      keywords: ['available', 'availability', 'free', 'busy', 'hire', 'start', 'project'],
      answer: "✅ Yes! Rabin is currently available for new projects — both short-term engagements and long-term retainers. He typically responds to new enquiries within 24 hours on business days.",
      quickReplies: ['📞 Book a discovery call', '💰 Rates & pricing?', '⏱️ Typical timelines?']
    },
    {
      keywords: ['rate', 'price', 'cost', 'charge', 'fee', 'money', 'budget', 'pay', 'invoice'],
      answer: "Rabin offers both fixed-price and retainer models:\n\n• Fixed-price for well-defined projects with clear scope\n• Monthly retainer for ongoing development or team support\n\nRates are discussed during a free 30-min discovery call based on your project needs and duration. No hourly surprises.",
      quickReplies: ['📞 Book a free call', '⏱️ How long do projects take?']
    },
    {
      keywords: ['time', 'timeline', 'long', 'duration', 'weeks', 'month'],
      answer: "Typical project timelines:\n\n• Admin dashboard: 3–6 weeks\n• Enterprise portal (SPA): 6–16 weeks\n• Ionic mobile app: 6–12 weeks\n• Angular migration: 2–8 weeks\n• Performance audit + fix: 1–3 weeks\n\nTimelines depend on complexity and your feedback speed.",
      quickReplies: ['📞 Discuss my project', '💰 Cost?']
    },
    {
      keywords: ['angular', 'stack', 'tech', 'technology', 'skill', 'rxjs', 'signal', 'typescript'],
      answer: "Rabin's core stack:\n\n⚡ Angular 17–21 (Signals, Zoneless, OnPush)\n📘 TypeScript · RxJS · NgRx\n📱 Ionic Angular · Capacitor\n🎨 SCSS · Tailwind · Angular Material\n🔧 Node.js · Express · MongoDB\n🛡️ JWT auth · RBAC · REST APIs",
      quickReplies: ['💼 See projects', '📞 Book a call']
    },
    {
      keywords: ['ionic', 'mobile', 'app', 'android', 'ios', 'phone'],
      answer: "Yes! Rabin builds cross-platform mobile apps using Ionic Angular + Capacitor. He's delivered:\n\n• Biometric authentication (Face ID / Touch ID)\n• Offline-capable apps for low-bandwidth regions\n• App Store & Google Play submissions\n• Native plugin integrations",
      quickReplies: ['📞 Discuss a mobile project', '💼 See mobile project']
    },
    {
      keywords: ['nda', 'confidential', 'secret', 'private', 'sign'],
      answer: "Absolutely. Rabin signs NDAs before any sensitive project discussions. Client confidentiality is non-negotiable.",
      quickReplies: ['📞 Book a call to discuss']
    },
    {
      keywords: ['location', 'timezone', 'time zone', 'india', 'remote', 'ist', 'where'],
      answer: "Rabin is based in Chennai, India (IST, UTC+5:30). He regularly works with clients in:\n\n🌍 Europe · North America · Australia · Africa · Asia\n\nHe schedules overlap hours to match your team's working hours.",
      quickReplies: ['📞 Schedule a call']
    },
    {
      keywords: ['process', 'how', 'work', 'workflow', 'step', 'start', 'begin'],
      answer: "Rabin's process:\n\n1️⃣ Discovery Call (30 min, free)\n2️⃣ Proposal & Scope (within 48h)\n3️⃣ Build & Iterate (weekly updates + staging URL)\n4️⃣ Launch & Handoff (+ 30 days post-launch support)\n\nSimple, transparent, no surprises.",
      quickReplies: ['📞 Start with a discovery call']
    },
    {
      keywords: ['book', 'call', 'calendly', 'meet', 'meeting', 'schedule', 'calendar', 'discovery'],
      answer: "📞 Great! You can book a free 30-minute discovery call — no commitment required. Rabin will review your project requirements and suggest the best approach.",
      quickReplies: ['📅 Open Calendly now', '✉️ Send an email instead']
    },
    {
      keywords: ['contact', 'email', 'reach', 'message', 'dm', 'talk'],
      answer: "You can reach Rabin at:\n\n📧 rabinr2607@gmail.com\n💼 linkedin.com/in/rabinr\n📅 Book a call: calendly.com/rabinr/discovery-call\n\nExpect a reply within 24 hours on business days.",
      quickReplies: ['📞 Book a call', '💼 View projects']
    }
  ];

  private readonly fallbackAnswer = "I'm not sure about that specific detail, but Rabin would be happy to answer directly! The best way is to send a message via the Contact section below or book a free discovery call.";

  ngAfterViewInit() {
    // Show welcome message after brief delay
    setTimeout(() => {
      this.addBotMessage(
        "👋 Hi! I'm Rabin's assistant. Ask me anything about his Angular & Ionic development services, availability, or how to start a project!",
        ['💼 What services?', '⏰ Available now?', '📞 Book a call', '💰 Rates?']
      );
    }, 600);
  }

  ngOnDestroy() {}

  protected toggleChat() {
    this.isOpen.update(v => !v);
    this.hasUnread.set(false);
    if (this.isOpen()) {
      setTimeout(() => this.inputEl?.nativeElement?.focus(), 100);
    }
  }

  protected sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    this.addUserMessage(text);
    this.processResponse(text);
  }

  protected sendQuickReply(qr: string) {
    if (qr === '📅 Open Calendly now') {
      window.open('https://calendly.com/rabinr/discovery-call', '_blank');
      this.addBotMessage("I've opened the Calendly booking page in a new tab. Pick a time that works for you! 🗓️");
      return;
    }
    if (qr === '✉️ Send an email instead') {
      window.open('mailto:rabinr2607@gmail.com', '_blank');
      this.addBotMessage("📧 Opening your email client to rabinr2607@gmail.com. Rabin typically replies within 24 hours!");
      return;
    }
    if (qr === '🗂️ See projects') {
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
      this.addBotMessage("Scrolling to the projects section — take a look at Rabin's enterprise and government work! 👇");
      return;
    }
    this.addUserMessage(qr.replace(/^[^\w]+/, '').trim());
    this.processResponse(qr);
  }

  private processResponse(text: string) {
    this.isTyping.set(true);
    this.scrollToBottom();

    const lower = text.toLowerCase();
    const match = this.faqs.find(faq => faq.keywords.some(kw => lower.includes(kw)));

    setTimeout(() => {
      this.isTyping.set(false);
      if (match) {
        this.addBotMessage(match.answer, match.quickReplies);
      } else {
        this.addBotMessage(this.fallbackAnswer, ['📞 Book a call', '✉️ Contact via email']);
      }
    }, 800 + Math.random() * 400);
  }

  private addUserMessage(text: string) {
    this.messages.update(msgs => [...msgs, {
      id: ++this.msgIdCounter,
      type: 'user',
      text,
      timestamp: new Date()
    }]);
    this.scrollToBottom();
  }

  private addBotMessage(text: string, quickReplies?: string[]) {
    this.messages.update(msgs => [...msgs, {
      id: ++this.msgIdCounter,
      type: 'bot',
      text,
      timestamp: new Date(),
      quickReplies
    }]);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
