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
import {
  selectUsersList,
  selectUsersMeta,
} from '../../../../store/admin/users/user.selector';
import {
  loadUsers,
  toggleBlockAndLoadUsers,
} from '../../../../store/admin/users/users.actions';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type UserOrTrainer = User | Trainer;

@Component({
  selector: 'app-admin-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, PaginationComponent],
  templateUrl: './admin-user-listing.component.html',
  styleUrls: ['./admin-user-listing.component.scss'],
})
export class AdminUserListingComponent implements OnInit {
  users$!: Observable<UserOrTrainer[]>;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  loading = false;
  isLoadingUsers = false;
  currentPage = 1;
  totalPages = 1;
  limit = 6;
  filter: 'all' | 'user' | 'trainer' | 'blocked' = 'all';

  constructor(private store: Store, private adminService: AdminService) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.users$ = this.store.select(selectUsersList);

    this.store.select(selectUsersMeta).subscribe((meta) => {
      this.totalPages = meta.totalPages;
      this.limit = meta.limit;
      this.currentPage = meta.page;
    });
    this.loadUsers(this.searchTerm, this.currentPage);
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

//   onSearchFrontEnd(term: string){
// console.log('term', term);
// this.users$.subscribe((res) =>{
//   console.log('res', res);
// })

//   }



  loadUsers(searchTerm: string = '', page: number = 1): void {
    this.currentPage = page;
    const params: GetUsersParams = {
      page,
      limit: this.limit,
      search: searchTerm,
      filter: this.filter,
    };
    this.store.dispatch(loadUsers({ params }));
  }

  isTrainer(user: User | Trainer): user is Trainer {
    return (user as Trainer).verificationStatus !== undefined;
  }

  onPageChange(page: number): void {
    this.loadUsers(this.searchTerm, page);
  }

  toggleBlockStatus(user: User | Trainer): void {
    const params: GetUsersParams = {
      page: this.currentPage,
      limit: this.limit,
      search: this.searchTerm,
    };

    this.store.dispatch(
      toggleBlockAndLoadUsers({
        userId: user._id,
        role: user.role,
        params,
      })
    );
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as
      | 'all'
      | 'user'
      | 'trainer'
      | 'blocked';
    this.filter = value;
    this.loadUsers(this.searchTerm, 1);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/default-user.png';
  }
}
