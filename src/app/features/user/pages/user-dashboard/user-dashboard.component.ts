import { Component } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  imports: [  CategoryCardComponent, CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent {
  categories = [
    { value: 'cardio', label: 'Cardio' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'martial_arts', label: 'Martial Arts' },
    { value: 'fitness', label: 'Fitness' },
  ];
}
