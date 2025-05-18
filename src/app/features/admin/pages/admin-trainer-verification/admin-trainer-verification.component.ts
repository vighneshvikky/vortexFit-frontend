import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { FormsModule } from '@angular/forms';
import { selectUnverifiedTrainers, selectUsersLoaded } from '../../../../store/admin/users/user.selector';
import { loadUsers } from '../../../../store/admin/users/users.actions';

@Component({
  selector: 'app-admin-trainer-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './admin-trainer-verification.component.html',
  styleUrl: './admin-trainer-verification.component.scss'
})
export class AdminTrainerVerificationComponent implements OnInit {
 unverifiedTrainers$: Observable<Trainer[]>;

 constructor(private store: Store){
  this.unverifiedTrainers$ = this.store.select(selectUnverifiedTrainers)
 }

 ngOnInit(): void {
   this.store.select(selectUsersLoaded).pipe(take(1)).subscribe(loaded => {
    if(!loaded){
       this.store.dispatch(loadUsers({params: {role: 'trainer'}}))
    }
   })
 }
}
