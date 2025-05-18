import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetUsersParams, User, AdminService } from '../../services/admin.service';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { Observable, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUsersList } from '../../../../store/admin/users/user.selector';
import { loadUsers } from '../../../../store/admin/users/users.actions';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

type UserOrTrainer = User | Trainer;

@Component({
  selector: 'app-admin-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-user-listing.component.html',
  styleUrls: ['./admin-user-listing.component.scss']
})
export class AdminUserListingComponent implements OnInit {
  users$!: Observable<UserOrTrainer[]>;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  loading = false;
  isLoadingUsers = false;

  constructor(
    private store: Store,
    private adminService: AdminService
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.loadUsers(term);
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  loadUsers(searchTerm: string = ''): void {
    this.isLoadingUsers = true;
    const params: GetUsersParams = {
      page: 1,
      limit: 10,
      search: searchTerm,
    };

    this.store.dispatch(loadUsers({ params }));
    this.users$ = this.store.select(selectUsersList);
    this.users$.subscribe(() => {
      this.isLoadingUsers = false;
    });
  }

  isTrainer(user: User | Trainer): user is Trainer {
    return (user as Trainer).verificationStatus !== undefined;
  }

  toggleBlockStatus(user: User): void {
    this.loading = true;
    this.adminService.toggleBlockStatus(user._id, user.role)
      .subscribe({
        next: () => {
          this.loadUsers(this.searchTerm);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error toggling block status:', error);
          this.loading = false;
        }
      });
  }
}
