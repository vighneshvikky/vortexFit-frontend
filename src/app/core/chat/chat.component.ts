import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../features/user/services/user.service';
import { TrainerService } from '../../features/trainer/services/trainer.service';
import { User } from '../../features/admin/services/admin.service';
import { ChatService } from './chat.service';
import { ChatMessage } from './interfaces/chat.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { firstValueFrom } from 'rxjs';
import {
  selectCurrentUser,
  selectCurrentUserId,
} from '../../features/auth/store/selectors/auth.selectors';
import { Trainer } from '../../features/trainer/models/trainer.interface';
import { generateRoomId } from './utils/room.util';
import { SocketService } from './services/socket.service';
import { NotyService } from '../services/noty.service';

export interface UserRole {
  isTrainer: boolean;
  isUser: boolean;
}

export interface LastMessages {
  lastMessage: string;
  lastUpdated: Date;
  participantId: string;
  name: string;
  email: string;
  image?: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  peerId = '';
  text = '';
  messages: ChatMessage[] = [];
  sub?: Subscription;
  userData!: User | Trainer | null;
  conversationsList: LastMessages[] = [];
  currentUserRole: UserRole = { isTrainer: false, isUser: false };
  pageTitle = '';
  currentUserId: string | undefined = '';
  sender: string = '';
  senderId: string = '';

  isMobileChatView = false;
  isDesktop = false;
  isTyping = false;
  isLoading = false;
  hasSelectedConversation = false;

  constructor(
    private chat: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private trainerService: TrainerService,
    private store: Store<AppState>,
    private socketService: SocketService,
    private notify: NotyService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isDesktop = window.innerWidth >= 768;
      if (window.innerWidth < 768 && !this.hasSelectedConversation) {
        this.isMobileChatView = false;
      }
    }
  }

  ngOnInit() {
    this.checkScreenSize();
console.log('chat component')
    this.store.select(selectCurrentUser).subscribe((currentUser) => {
      this.currentUserRole = { isTrainer: false, isUser: false };

      if (currentUser?.role === 'trainer') {
        this.sender = 'user';
        this.pageTitle = 'Trainer Messaging';
        this.currentUserRole.isTrainer = true;
      } else if (currentUser?.role === 'user') {
        this.sender = 'trainer';
        this.pageTitle = 'User Messaging';
        this.currentUserRole.isUser = true;
      }
    });

    this.sub = this.socketService
      .getSocketErrors()
      .subscribe(({ namespace, message }) => {
        console.warn(`[${namespace}] Error received:`, message);

        if (message === 'Unauthorized: No user ID') {
          this.router.navigate(['/login']);
        } else if (message === 'No active subscription') {
          if (this.currentUserRole.isUser) {
            this.router.navigate(['/user/plans']);
            this.notify.showInfo('Subscribe plan for this Feature');
          } else {
            this.router.navigate(['/trainer/plans']);
            this.notify.showInfo('Subscribe plan for this Feature');
          }
        }
      });
      console.log('sub errors', this.sub);
    this.loadChatData();
  }

  private loadChatData() {
    const userId = this.route.snapshot.paramMap.get('id');

    if (!userId) {
      this.isLoading = true;
      this.hasSelectedConversation = false;
      this.userData = null;

      this.chat.getAllMessages().subscribe({
        next: (res: any) => {
          console.log('All conversations:', res);
          this.conversationsList = res || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.hasSelectedConversation = true;
      this.peerId = userId;

      if (!this.isDesktop) {
        this.isMobileChatView = true;
      }

      this.initializeChat();

      const service =
        this.sender === 'user' ? this.trainerService : this.userService;

      this.isLoading = true;
      service.getUserData(userId).subscribe({
        next: (res: User | Trainer) => {
          this.userData = res;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.isLoading = false;
        },
      });
    }
  }

  private async initializeChat() {
    this.currentUserId = await firstValueFrom(
      this.store.select(selectCurrentUserId)
    );
    if (!this.currentUserId) {
      console.warn('Missing current userId in store');
      return;
    }

    this.senderId = this.currentUserId;
    this.chat.connect(this.currentUserId);

    if (this.peerId) {
      const roomId = generateRoomId(this.currentUserId, this.peerId);
      console.log('Joining room:', roomId);
      this.chat.joinRoom(roomId);

      this.chat.getMessages(roomId, 1, 50).subscribe((history) => {
        this.messages = history || [];
      });

      this.sub = this.chat.stream().subscribe((msg) => {
        if (msg) {
          console.log('Appending to UI:', msg);
          this.messages.push(msg);
        }
      });
    }
  }

  showMobileConversationList() {
    this.isMobileChatView = false;
    this.router.navigate(['/chat']);
  }

  toggleMobileMenu() {
    console.log('Toggle mobile menu');
  }

  selectConversation(conversation: LastMessages) {
    console.log('Conversation selected:', conversation);
    if(this.currentUserRole.isUser){
this.router.navigate(['/user/chat', conversation.participantId]);
    }else{
      this.router.navigate(['/trainer/chat', conversation.participantId]);
    }
    
  }

  trackMessage(index: number, message: ChatMessage): any {
    return message._id || index;
  }

  trackConversation(index: number, conversation: LastMessages): any {
    return conversation.participantId || index;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send() {
    if (!this.peerId || !this.text?.trim()) return;

    this.isTyping = true;

    this.chat.send(this.peerId, this.senderId, this.text.trim());
    this.text = '';

    setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  getCurrentUserAvatar(): string {
    if (this.currentUserRole.isTrainer) {
      return 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
  }

  getSentMessageClass(): string {
    return this.currentUserRole.isTrainer ? 'bg-red-500' : 'bg-blue-500';
  }

  getButtonClass(): string {
    return this.currentUserRole.isTrainer
      ? 'text-red-600 hover:text-red-800 focus:ring-red-500'
      : 'text-blue-600 hover:text-blue-800 focus:ring-blue-500';
  }

  formatTime(date: string | Date): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.chat.disconnect();
  }
}
