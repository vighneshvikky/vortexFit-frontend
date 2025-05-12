import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { ToastService } from '../../../core/services/noty.service';
import { NotyService } from '../../../core/services/noty.service';

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
    private notyService: NotyService
  ) {}

  selectRole(role: 'user' | 'trainer') {
    this.notyService.showSuccess( `Redirecting to ${role} signup...`);
    
    setTimeout(() => {
      this.router.navigate(['auth/signup'], { queryParams: { role } });
    }, 3000);
  }
 }
