import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage } from '../../../../core/chat/interface/chat.interface';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../../core/chat/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trainer-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-chat.component.html',
  styleUrl: './trainer-chat.component.scss'
})
export class TrainerChatComponent implements OnInit, OnDestroy {
  peerId = '';    
  text = '';        
  messages: ChatMessage[] = [];
  sub?: Subscription;

  constructor(private chat: ChatService) {}

  ngOnInit() {
    
    this.chat.connect();

   
    this.sub = this.chat.stream().subscribe(msg => {
      if (msg) this.messages.push(msg);
    });
  }

  async send() {
    if (!this.peerId || !this.text.trim()) return;
    await this.chat.send(this.peerId, this.text.trim());
    this.text = '';
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.chat.disconnect();
  }
}
