import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetUsersParams, User } from '../../services/admin.service';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUsersList } from '../../../../store/admin/users/user.selector';
import { loadUsers } from '../../../../store/admin/users/users.actions';
type UserOrTrainer = User | Trainer;
@Component({
  selector: 'app-admin-user-listing',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './admin-user-listing.component.html',
  styleUrls: ['./admin-user-listing.component.scss']
})


export class AdminUserListingComponent implements OnInit {
   users$!: Observable<UserOrTrainer[]>;
 constructor(private store: Store){}
 ngOnInit(): void {
    const params: GetUsersParams = {
      page: 1,
      limit: 10,
      search: '',
    };

    this.store.dispatch(loadUsers({ params }));
    this.users$ = this.store.select(selectUsersList);
 }

  isTrainer(user: User | Trainer): user is Trainer {
    return (user as Trainer).verificationStatus !== undefined;
  }
}
