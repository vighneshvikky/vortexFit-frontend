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
  @Input() maxVisiblePages: number = 5; // Adjust based on screen size
  @Output() pageChanged = new EventEmitter<number>();

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
