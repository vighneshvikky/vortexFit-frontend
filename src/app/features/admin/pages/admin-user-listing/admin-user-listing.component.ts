import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GetUsersParams,
  User,
  AdminService,
} from '../../services/admin.service';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { Observable, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUsersList } from '../../../../store/admin/users/user.selector';
import {
  loadUsers,
  toggleBlockAndLoadUsers,
} from '../../../../store/admin/users/users.actions';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

type UserOrTrainer = User | Trainer;

@Component({
  selector: 'app-admin-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-user-listing.component.html',
  styleUrls: ['./admin-user-listing.component.scss'],
})
export class AdminUserListingComponent implements OnInit {
  users$!: Observable<UserOrTrainer[]>;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  loading = false;
  isLoadingUsers = false;

  constructor(private store: Store, private adminService: AdminService) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.users$ = this.store.select(selectUsersList);
    this.loadUsers();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((term) => {
        this.loadUsers(term);
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  loadUsers(searchTerm: string = ''): void {
    const params: GetUsersParams = {
      page: 1,
      limit: 10,
      search: searchTerm,
    };

    this.store.dispatch(loadUsers({ params }));
  }

  isTrainer(user: User | Trainer): user is Trainer {
    return (user as Trainer).verificationStatus !== undefined;
  }

  toggleBlockStatus(user: User | Trainer): void {
    console.log('user', user)
  const params: GetUsersParams = {
    page: 1,
    limit: 10,
    search: this.searchTerm
  };

  this.store.dispatch(toggleBlockAndLoadUsers({
    userId: user._id,
    role: user.role,
    params
  }))
  }
}
