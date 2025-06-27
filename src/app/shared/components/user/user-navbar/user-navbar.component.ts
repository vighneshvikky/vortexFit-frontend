import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SearchService } from '../../../../features/user/services/search.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-navbar',
  imports: [RouterModule, FormsModule],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.scss'
})
export class UserNavbarComponent {
 searchTerm: string = '';
  
  private searchService = inject(SearchService);
  private router = inject(Router);

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.searchService.updateSearchTerm(this.searchTerm.trim());
      this.router.navigate(['/user/all-trainers']); 
    }
  }
}
