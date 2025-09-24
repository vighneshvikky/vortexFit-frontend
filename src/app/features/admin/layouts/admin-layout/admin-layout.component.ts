  import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/admin/sidebar/sidebar.component';
import { AdminService } from '../../services/admin.service';
import { AppState } from '../../../../store/app.state';
import { Store } from '@ngrx/store';
import { logout } from '../../../auth/store/actions/auth.actions';


@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {

  sidebarOpen = true;
   private store = inject(Store<AppState>)
  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogOut(): void {

    this.store.dispatch(logout())
  }
}
