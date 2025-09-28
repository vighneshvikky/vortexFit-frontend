import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SearchService } from '../../../../features/user/services/search.service';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { selectCurrentUser } from '../../../../features/auth/store/selectors/auth.selectors';
import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../../../features/auth/store/actions/auth.actions';
import { onImageError } from '../../../methods/image-checker';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-navbar',
  imports: [RouterModule, FormsModule, AsyncPipe, RouterModule],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.scss'
})
export class UserNavbarComponent implements OnInit{
 searchTerm: string = '';
 $currentUser!: Observable<AuthenticatedUser | null>;
  
  private searchService = inject(SearchService);
  private router = inject(Router);
  private store = inject(Store<AppState>);

  ngOnInit(): void {
    this.$currentUser = this.store.select(selectCurrentUser)
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.searchService.updateSearchTerm(this.searchTerm.trim());
      this.router.navigate(['/user/all-trainers']); 
    }
  }

  onImageError(event: Event){
    onImageError(event)
  }
}
