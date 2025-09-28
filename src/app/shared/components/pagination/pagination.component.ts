import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges{
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() maxVisiblePages: number = 5; 
  @Output() pageChanged = new EventEmitter<number>();
  @Input() role: 'admin' | 'user' | 'trainer' = 'admin';


  paginationRange: (number | string)[] = [];

  ngOnChanges() {
    this.paginationRange = this.getPaginationRange();
  }

  getPaginationRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxVisiblePages;
    const delta = Math.floor(max / 2);

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range: (number | string)[] = [];
    let left = Math.max(1, current - delta);
    let right = Math.min(total, current + delta);

    if (current <= delta) {
      right = max;
    }

    if (current + delta >= total) {
      left = total - max + 1;
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 1) {
      range.unshift('...');
      range.unshift(1);
    }

    if (right < total) {
      range.push('...');
      range.push(total);
    }

    return range;
  }

  get theme() {
  switch (this.role) {
    case 'user':
      return {
        primary: 'bg-orange-500',
        hover: 'hover:bg-orange-600',
        default: 'bg-orange-400',
        disabled: 'disabled:opacity-50',
        text: 'text-white'
      };
    case 'trainer':
      return {
        primary: 'bg-red-500',
        hover: 'hover:bg-red-600',
        default: 'bg-red-400',
        disabled: 'disabled:opacity-50',
        text: 'text-white'
      };
    case 'admin':
    default:
      return {
        primary: 'bg-gray-700',
        hover: 'hover:bg-gray-800',
        default: 'bg-gray-600',
        disabled: 'disabled:opacity-50',
        text: 'text-white'
      };
  }
}


  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      console.log('page', page)
      this.pageChanged.emit(page);
    }
  }

  prev() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
}
