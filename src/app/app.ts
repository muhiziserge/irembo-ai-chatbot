import { Component, inject } from '@angular/core';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  theme = inject(ThemeService);
}
