import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme.service';

export interface Resource {
  label: string;
  url: string;
}

export interface SlotItem {
  date: string;
  location: string;
  time: string;
  seats: number;
  seatsColor: 'orange' | 'blue' | 'green';
}

export interface ParsedPill {
  icon: string;
  label: string;
}

export interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  chips?: string[];
  selectedChip?: string;
  resources?: Resource[];
  expandedResources?: boolean;
  slots?: SlotItem[];
  slotsExpanded?: boolean;
  parsedPills?: ParsedPill[];
  showBookButton?: boolean;
}

type ConversationState =
  | null
  | 'slots_category'
  | 'slots_district'
  | 'slots_date';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatSection') chatSection!: ElementRef;

  theme = inject(ThemeService);

  isOpen = signal(false);
  isTyping = signal(false);
  isDarkMode = signal(false);
  inputText = '';
  messages = signal<ChatMessage[]>([]);

  suggestions = [
    'I want to view available driving test slots.',
    'Check my application status',
    'How to renew my visa',
    'How to transfer ownership of my land'
  ];

  private conversationState: ConversationState = null;
  private selectedCategory = '';
  private selectedDistrict = '';
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

  toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
  }

  sendSuggestion(text: string): void {
    const msgs = this.messages();
    const lastChipMsg = [...msgs].reverse().find(m => m.type === 'ai' && m.chips && m.chips.length > 0);
    if (lastChipMsg) {
      lastChipMsg.selectedChip = text;
      this.messages.set([...msgs]);
    }
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
    }, 1000);
  }

  private buildResponse(userText: string): ChatMessage {
    const lower = userText.toLowerCase().trim();

    // ---------- Slots guided flow ----------
    if (this.conversationState === 'slots_category') {
      const cat = userText.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(cat)) {
        this.selectedCategory = cat;
        this.conversationState = 'slots_district';
        return {
          type: 'ai',
          text: `Got it — Category ${cat} 🚗\n\nWhich district works best for you? select or type any.`,
          chips: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera']
        };
      }
      return {
        type: 'ai',
        text: `Please select a license category: A, B, C, or D.`,
        chips: ['A', 'B', 'C', 'D']
      };
    }

    if (this.conversationState === 'slots_district') {
      this.selectedDistrict = userText;
      this.conversationState = 'slots_date';
      return {
        type: 'ai',
        text: `Got it — Category ${this.selectedCategory} in ${userText} district\n\nwhen? Choose or Type a date or time range.`,
        chips: ['This week', 'This month', 'Next week', 'Next month']
      };
    }

    if (this.conversationState === 'slots_date') {
      const cat = this.selectedCategory;
      const dist = this.selectedDistrict;
      this.conversationState = null;
      return {
        type: 'ai',
        text: `Found 10 slots matching:`,
        parsedPills: [
          { icon: 'images/icon-pin.svg',      label: dist },
          { icon: 'images/icon-car.svg',      label: `Category ${cat}` },
          { icon: 'images/icon-calendar.svg', label: userText }
        ],
        slots: [
          { date: '05-05-2026', location: 'Kanombe - Rubirizi (GAS)', time: '7–9 AM',   seats: 3,  seatsColor: 'orange' },
          { date: '06-05-2026', location: 'Kanombe - Rubirizi (GAS)', time: '7–9 AM',   seats: 19, seatsColor: 'blue'   },
          { date: '07-05-2026', location: 'Kanombe - Rubirizi (GAS)', time: '7–9 AM',   seats: 20, seatsColor: 'green'  },
          { date: '08-05-2026', location: 'Kanombe - Rubirizi (GAS)', time: '7–9 AM',   seats: 19, seatsColor: 'blue'   },
          { date: '09-05-2026', location: 'Gahanga - Kicukiro (KIC)',  time: '9–11 AM',  seats: 5,  seatsColor: 'orange' },
          { date: '10-05-2026', location: 'Gahanga - Kicukiro (KIC)',  time: '9–11 AM',  seats: 12, seatsColor: 'blue'   },
          { date: '11-05-2026', location: 'Nyabugogo - Gasabo (GAS)',  time: '7–9 AM',   seats: 8,  seatsColor: 'orange' },
          { date: '12-05-2026', location: 'Nyabugogo - Gasabo (GAS)',  time: '1–3 PM',   seats: 20, seatsColor: 'green'  },
          { date: '13-05-2026', location: 'Kanombe - Rubirizi (GAS)', time: '9–11 AM',  seats: 15, seatsColor: 'blue'   },
          { date: '14-05-2026', location: 'Gahanga - Kicukiro (KIC)',  time: '7–9 AM',   seats: 2,  seatsColor: 'orange' }
        ],
        slotsExpanded: false,
        showBookButton: true
      };
    }

    // ---------- Intent detection ----------
    if (lower.includes('driving test') || lower.includes('test slot') || lower.includes('driving slot')) {
      this.conversationState = 'slots_category';
      return {
        type: 'ai',
        text: `Sure! I can help you find available driving test slots.\n\nFirst, which license category are you applying for?`,
        chips: ['A', 'B', 'C', 'D']
      };
    }

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

    if (lower.includes('traffic') || lower.includes('fine')) {
      return {
        type: 'ai',
        text: `To pay traffic fines on iremboGov:\n\n**Steps**\n1. Log in to your iremboGov account\n2. Go to **Traffic Fines** under Transport\n3. Enter your vehicle registration number\n4. Review fines and proceed to payment\n\nPayment: MoMo, bank card, or Irembo Pay.`
      };
    }

    if (lower.includes('application') || lower.includes('status')) {
      return {
        type: 'ai',
        text: `To check your application status:\n\n1. Log in to **iremboGov**\n2. Go to **My Applications** in the dashboard\n3. Select the application you want to track\n\nYou also receive real-time SMS/email updates.`
      };
    }

    if (lower.includes('visa') || lower.includes('renew')) {
      return {
        type: 'ai',
        text: `To renew your visa on iremboGov:\n\n**📋 Requirements**\n- Valid passport (min 6 months validity)\n- Current visa or residence permit\n- Proof of accommodation in Rwanda\n\nProcessing: 3–5 working days.`,
        resources: [
          { label: 'Guide to visa renewal in Rwanda', url: 'https://irembo.gov.rw' }
        ],
        expandedResources: false
      };
    }

    if (lower.includes('land') || lower.includes('ownership') || lower.includes('transfer')) {
      return {
        type: 'ai',
        text: `To transfer land ownership:\n\n**📋 Required Documents**\n- Original land title certificate\n- National IDs of both parties\n- Proof of payment/sale agreement\n- Tax clearance certificate\n\nApply online via iremboGov or at your nearest RLMUA office.`
      };
    }

    return {
      type: 'ai',
      text: `Thank you for your question! I can help with:\n\n- 🚗 Driving test slots\n- 📄 Birth certificates\n- ✈️ Visa renewal\n- 🏛️ Land transfers\n- 📋 Application status\n\nCould you share more details?`
    };
  }

  expandSlots(msg: ChatMessage): void {
    msg.slotsExpanded = true;
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    if (this.chatSection?.nativeElement) {
      const el = this.chatSection.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
