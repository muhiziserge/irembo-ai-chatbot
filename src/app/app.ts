import { Component } from '@angular/core';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
