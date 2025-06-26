import { Component, inject, OnInit } from '@angular/core';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { UserService } from '../../services/user.service';
import {  AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORIES, CATEGORY_TO_SPECIALIZATIONS } from '../../../../shared/constants/filter-options';

@Component({
  selector: 'app-all-traniners',
  imports: [ CommonModule, FormsModule],
  templateUrl: './all-traniners.component.html',
  styleUrl: './all-traniners.component.scss',
})
export class AllTraninersComponent implements OnInit {
 trainers: Trainer[] = [];

  filteredTrainers: Trainer[] = [];
  groupedTrainers: { [key: string]: Trainer[] } = {};
  

  selectedCategory: string = '';
  selectedSpecialization: string = '';
  minPrice: number = 0;
  maxPrice: number = 1000;
  minExperience: number = 0;

  categories =  CATEGORIES
  categoryToSpecializations: { [category: string]: string[] } = CATEGORY_TO_SPECIALIZATIONS

  specializations: string[] = [];
  
  // UI state
  showFilters: boolean = false;
  
  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getTrainer().subscribe({
      next: (res) => {
        this.trainers = res;
        // Initialize filters after data is loaded
        this.initializeFilterOptions();
        this.applyFilters();
      },
      error: (err) => {
        console.log('err', err);
      },
    });
  }

  initializeFilterOptions(): void {
    // Get all available specializations from the predefined mapping
    this.specializations = Object.values(this.categoryToSpecializations).flat();
    
    // Remove duplicates
    this.specializations = [...new Set(this.specializations)];
    
    // Debug: Log the trainers data to see what we're working with
    console.log('Trainers data:', this.trainers);
    console.log('Available categories:', this.categories);
    console.log('Available specializations:', this.specializations);
  }

  applyFilters(): void {
    this.filteredTrainers = this.trainers.filter(trainer => {
      const categoryMatch = !this.selectedCategory || trainer.category === this.selectedCategory;
      const specializationMatch = !this.selectedSpecialization || 
        (trainer.specialization && Array.isArray(trainer.specialization) && 
         trainer.specialization.includes(this.selectedSpecialization));
      const priceMatch = this.isPriceInRange(trainer.pricing);
      const experienceMatch = trainer.experience >= this.minExperience;
      
      return categoryMatch && specializationMatch && priceMatch && experienceMatch;
    });
    
    this.groupTrainersByCategory();
    
    // Debug: Log filtered results
    console.log('Filtered trainers:', this.filteredTrainers);
    console.log('Grouped trainers:', this.groupedTrainers);
  }

  isPriceInRange(pricing: any): boolean {
    if (!pricing) return true; // If no pricing info, don't filter out
    
    const hourlyPrice = pricing.hourly || pricing.per_hour || 0;
    const monthlyPrice = pricing.monthly || pricing.per_month || 0;
    const packagePrice = pricing.package || 0;
    
    // Get the minimum price available
    const prices = [hourlyPrice, monthlyPrice / 20, packagePrice / 30].filter(p => p > 0);
    if (prices.length === 0) return true; // No valid pricing, don't filter out
    
    const minPrice = Math.min(...prices);
    return minPrice >= this.minPrice && (this.maxPrice === 0 || minPrice <= this.maxPrice);
  }

  groupTrainersByCategory(): void {
    this.groupedTrainers = this.filteredTrainers.reduce((groups, trainer) => {
      const category = trainer.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(trainer);
      return groups;
    }, {} as { [key: string]: Trainer[] });
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedSpecialization = '';
    this.minPrice = 0;
    this.maxPrice = 1000;
    this.minExperience = 0;
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getCategoryDisplayName(category: string): string {
    const categoryObj = this.categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Helper method to get available specializations for selected category
  getSpecializationsForCategory(): string[] {
    if (!this.selectedCategory) {
      return this.specializations;
    }
    return this.categoryToSpecializations[this.selectedCategory] || [];
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
