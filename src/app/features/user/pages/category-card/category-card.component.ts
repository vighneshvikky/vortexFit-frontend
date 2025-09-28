import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CATEGORIES,
  CATEGORY_IMAGES,
} from '../../../../shared/constants/filter-options';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-card',
  imports: [RouterModule, CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})

 


export class CategoryCardComponent {
  @Input() label!: string;
  @Input() value!: string;
  CATEGORIES = CATEGORIES;

  CATEGORY_IMAGES: { [key: string]: string } = {
    cardio: 'assets/images/category_images/cardio_image.avif',
    yoga: 'assets/images/category_images/yoga.avif',
    martial_arts: 'assets/images/category_images/martial_arts.avif',
    fitness: 'assets/images/category_images/fitness.avif'
}
  get imageUrl(): string {
    return this.CATEGORY_IMAGES[this.value] 
  }
}
