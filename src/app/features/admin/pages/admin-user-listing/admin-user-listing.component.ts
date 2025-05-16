import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService, User, PaginatedResponse, GetUsersParams } from '../../services/admin.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-admin-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-user-listing.component.html',
  styleUrls: ['./admin-user-listing.component.scss']
})
export class AdminUserListingComponent implements OnInit {
  users: User[] = [];
  searchTerm = '';
  selectedRole: 'user' | 'trainer' | 'all' = 'all';
  loading = false;
  error = '';
  sidebarOpen = true;
  activeMenuItem = 'users';
  togglingUserId: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  private searchSubject = new Subject<string>();

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      if (params['page']) {
        this.currentPage = +params['page'];
      }
      if (params['role']) {
        this.selectedRole = params['role'] as 'user' | 'trainer' | 'all';
      }
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
const params: GetUsersParams = {
  search: this.searchTerm,
  role: this.selectedRole !== 'all' ? this.selectedRole as 'user' | 'trainer' : undefined,
  page: this.currentPage,
  limit: this.itemsPerPage
};

   
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        role: this.selectedRole !== 'all' ? this.selectedRole : null,
        search: this.searchTerm || null
      },
      queryParamsHandling: 'merge'
    });

    this.adminService.getUsers(params).subscribe({
      next: (response: PaginatedResponse<User>) => {
        if (response && response.data) {
          this.users = response.data;
          this.totalItems = response.total || 0;
          this.totalPages = response.totalPages || 0;
        } else {
          this.users = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.users = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  toggleBlock(user: User): void {

    if (!user || !user._id || !user.role) {
      this.error = 'Invalid user data';
      return;
    }

    if (this.togglingUserId === user._id) return; 
    
    this.togglingUserId = user._id;
    this.error = ''; // Clear any previous errors

    this.adminService.toggleBlockStatus(user._id, user.role).subscribe({
      next: (updatedUser) => {
        // Update the user in the list
        const index = this.users.findIndex(u => u._id === user._id);
        if (index !== -1) {
          // Update only the isBlocked status
          this.users[index].isBlocked = !this.users[index].isBlocked;
        }
        this.togglingUserId = null;
      },
      error: (error) => {
        this.error = `Failed to ${user.isBlocked ? 'unblock' : 'block'} user. Please try again.`;
        this.togglingUserId = null;
        console.error('Error toggling block status:', error);
      }
    });
  }

  shouldShowPageButton(pageNumber: number): boolean {
    if (this.totalPages <= 7) return true;
    if (pageNumber === 1 || pageNumber === this.totalPages) return true;
    if (pageNumber >= this.currentPage - 1 && pageNumber <= this.currentPage + 1) return true;
    return false;
  }

  shouldShowEllipsis(pageNumber: number): boolean {
    if (this.totalPages <= 7) return false;
    if (pageNumber === 2 && this.currentPage > 3) return true;
    if (pageNumber === this.totalPages - 1 && this.currentPage < this.totalPages - 2) return true;
    return false;
  }

  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
    if (itemId === 'dashboard') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout(): void {
    this.router.navigate(['/admin/login']);
  }
}
