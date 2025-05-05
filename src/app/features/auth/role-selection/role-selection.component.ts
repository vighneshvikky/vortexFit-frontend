import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.scss'
})
export class RoleSelectionComponent {
  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

  selectRole(role: 'user' | 'trainer') {
    this.toastService.show({
      message: `Redirecting to ${role} signup...`,
      type: 'info',
      duration: 2000
    });
    
    setTimeout(() => {
      this.router.navigate(['auth/signup'], { queryParams: { role } });
    }, 1000);
  }
}
