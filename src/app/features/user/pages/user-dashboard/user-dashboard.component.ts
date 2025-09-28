import { Component } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { CATEGORIES } from '../../../../shared/constants/filter-options';

@Component({
  selector: 'app-user-dashboard',
  imports: [  CategoryCardComponent, CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent {
  categories = CATEGORIES
}
