import { Component } from '@angular/core';
import { AiChatService } from '../../services/ai-chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss',
})
export class AiChatComponent {
  userMessage = '';
  selectedPersonality = 'trainer';

  messages: { sender: 'user' | 'ai'; text: string }[] = [];

  personalities = [
    { value: 'trainer', label: '💪 Trainer', icon: 'fitness_center' },
    { value: 'nutritionist', label: '🍎 Nutritionist', icon: 'restaurant' },
    { value: 'motivator', label: '⚡ Motivator', icon: 'bolt' },
  ];

  constructor(private aiService: AiChatService) {}

  send() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ sender: 'user', text: this.userMessage });

    const msg = this.userMessage;
    const personality = this.selectedPersonality;
    this.userMessage = '';

    this.aiService.chat(msg, personality).subscribe((res) => {
      this.messages.push({ sender: 'ai', text: res.reply });
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.send();
    }
  }
}
