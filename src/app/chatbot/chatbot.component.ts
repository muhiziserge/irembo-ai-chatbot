import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Resource {
  label: string;
  url: string;
}

export interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  chips?: string[];
  resources?: Resource[];
  expandedResources?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatSection') chatSection!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  inputText = '';
  messages = signal<ChatMessage[]>([]);

  suggestions = [
    'Pay Traffic fines',
    'Check my application status',
    'How to renew my visa',
    'How to transfer ownership of my land'
  ];

  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleModal(): void {
    this.isOpen.update(v => !v);
  }

  closeModal(): void {
    this.isOpen.set(false);
  }

  sendSuggestion(text: string): void {
    this.addUserMessage(text);
    this.generateAiResponse(text);
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    this.addUserMessage(text);
    this.generateAiResponse(text);
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleResources(msg: ChatMessage): void {
    msg.expandedResources = !msg.expandedResources;
  }

  private addUserMessage(text: string): void {
    this.messages.update(msgs => [...msgs, { type: 'user', text }]);
    this.shouldScrollToBottom = true;
  }

  private generateAiResponse(userText: string): void {
    this.isTyping.set(true);
    this.shouldScrollToBottom = true;

    setTimeout(() => {
      const response = this.buildResponse(userText);
      this.messages.update(msgs => [...msgs, response]);
      this.isTyping.set(false);
      this.shouldScrollToBottom = true;
    }, 1200);
  }

  private buildResponse(userText: string): ChatMessage {
    const lower = userText.toLowerCase();

    if (lower.includes('birth certificate') || lower.includes('certificate')) {
      return {
        type: 'ai',
        text: `To apply for a birth certificate, follow these steps:\n\n**📋 Requirements**\n- You must have an Irembo account or visit the nearest Irembo agent for assistance.\n- You need a National ID number (for Rwandan citizens above 16 years) or a Citizen Application Number (for Rwandan citizens below 16 years).\n- A valid phone number and email address are required.`,
        resources: [
          { label: 'How to apply for birth certificate', url: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001193156-how-to-apply-for-a-birth-certificate' },
          { label: 'How to apply for birth certificate', url: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001193156-how-to-apply-for-a-birth-certificate' }
        ],
        expandedResources: false
      };
    }

    if (lower.includes('driving') || lower.includes('slot') || lower.includes('license')) {
      return {
        type: 'ai',
        text: `Sure! I can help you find available driving test slots.\n\nFirst, which license category are you applying for?`,
        chips: ['A', 'B', 'C', 'D']
      };
    }

    if (lower === 'a' || lower === 'b' || lower === 'c' || lower === 'd') {
      return {
        type: 'ai',
        text: `Got it — Category ${userText.toUpperCase()} 🚗\n\nWhich district works best for you?`,
        chips: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Nearest to me']
      };
    }

    if (lower.includes('traffic') || lower.includes('fine')) {
      return {
        type: 'ai',
        text: `To pay traffic fines on iremboGov:\n\n**Steps**\n1. Log in to your iremboGov account\n2. Navigate to **Traffic Fines** under the Transport section\n3. Enter your vehicle registration number\n4. Review the fines and proceed to payment\n\nPayment can be done via MoMo, bank card, or Irembo Pay.`,
        resources: [
          { label: 'How to pay traffic fines on iremboGov', url: 'https://irembo.gov.rw' }
        ],
        expandedResources: false
      };
    }

    if (lower.includes('application') || lower.includes('status')) {
      return {
        type: 'ai',
        text: `To check your application status:\n\n1. Log in to your **iremboGov** account\n2. Go to **My Applications** in the dashboard\n3. Select the application you want to check\n\nYou can also receive real-time updates via SMS or email.`
      };
    }

    if (lower.includes('visa') || lower.includes('renew')) {
      return {
        type: 'ai',
        text: `To renew your visa on iremboGov:\n\n**📋 Requirements**\n- Valid passport (at least 6 months validity)\n- Current visa or residence permit\n- Proof of accommodation in Rwanda\n- Completed online application form\n\nThe process takes 3–5 working days.`,
        resources: [
          { label: 'Guide to visa renewal in Rwanda', url: 'https://irembo.gov.rw' }
        ],
        expandedResources: false
      };
    }

    if (lower.includes('land') || lower.includes('ownership') || lower.includes('transfer')) {
      return {
        type: 'ai',
        text: `To transfer land ownership:\n\n**📋 Required Documents**\n- Original land title certificate\n- National IDs of both parties\n- Proof of payment/sale agreement\n- Tax clearance certificate\n\nVisit your nearest RLMUA office or apply online via iremboGov.`
      };
    }

    return {
      type: 'ai',
      text: `Thank you for your question! I can help you with various iremboGov services including:\n\n- Birth certificates\n- Driving test slots\n- Traffic fines payment\n- Visa renewal\n- Land transfers\n- Application status checks\n\nCould you provide more details about what you need?`
    };
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/^- (.+)$/gm, '• $1');
  }

  private scrollToBottom(): void {
    if (this.chatSection?.nativeElement) {
      const el = this.chatSection.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
