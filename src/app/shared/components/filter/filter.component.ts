import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  id: string;
  name: string;
}

export interface FilterConfig {
  entityLabel: string;
  entityPlaceholder: string;
  showEntityFilter: boolean;
  showStatusFilter: boolean;
  showDateFilters: boolean;
  showSearchFilter: boolean;
  searchPlaceholder?: string;
  statusOptions?: string[];
  theme?: 'user' | 'trainer' | 'admin';
}

export interface FilterValues {
  entity: FilterOption | null;
  status: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  @Input() config: FilterConfig = {
    entityLabel: 'Client',
    entityPlaceholder: 'All Clients',
    showEntityFilter: true,
    showStatusFilter: true,
    showDateFilters: true,
    showSearchFilter: false,
    searchPlaceholder: 'Search...',
    theme: 'trainer',
  };

  @Input() entityOptions: FilterOption[] = [];
  @Input() loading: boolean = false;
  @Input() autoApply: boolean = false;

  @Output() filtersChanged = new EventEmitter<FilterValues>();
  @Output() filtersApplied = new EventEmitter<FilterValues>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() searchPerformed = new EventEmitter<string>();

  filters: FilterValues = {
    entity: null,
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  };

  defaultStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  componentId = Math.random().toString(36).substring(2, 11);
  searchTimeout: number | null = null;

  constructor() {}

  onFilterChange(): void {
    this.filtersChanged.emit({ ...this.filters });

    if (this.autoApply) {
      this.applyFilters();
    }
  }

  onSearchSubmit(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchPerformed.emit(this.filters.searchTerm);
    if (!this.autoApply) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    this.filtersApplied.emit({ ...this.filters });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = window.setTimeout(() => {
      this.onFilterChange();
      if (this.autoApply) {
        this.searchPerformed.emit(this.filters.searchTerm);
      }
    }, 300);
  }
  clearFilters(): void {
    this.filters = {
      entity: null,
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    };
    this.filtersCleared.emit();
    this.filtersChanged.emit({ ...this.filters });

    if (this.autoApply) {
      this.applyFilters();
    }
  }
  hasActiveFilters(): boolean {
    return !!(
      this.filters.entity ||
      this.filters.status ||
      this.filters.dateFrom ||
      this.filters.dateTo ||
      this.filters.searchTerm?.trim()
    );
  }
  setFilters(filters: Partial<FilterValues>): void {
    this.filters = { ...this.filters, ...filters };
  }

  getFilters(): FilterValues {
    return { ...this.filters };
  }
  getContainerClasses(): string {
    const baseClasses = 'rounded-xl shadow-sm border p-4 sm:p-6';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} bg-gray-900/80 backdrop-blur-sm border-blue-500/30`;
      case 'admin':
        return `${baseClasses} bg-white border-gray-100`;
      case 'trainer':
      default:
        return `${baseClasses} bg-white border-gray-100`;
    }
  }

  getSearchFormClasses(): string {
    const baseClasses =
      'flex items-center backdrop-blur-sm rounded-lg shadow-inner max-w-xl w-full px-3 py-1 border';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} bg-gray-900/80 border-blue-500/30`;
      case 'admin':
        return `${baseClasses} bg-gray-50 border-gray-300`;
      case 'trainer':
      default:
        return `${baseClasses} bg-gray-50 border-red-300`;
    }
  }

  getSearchInputClasses(): string {
    const baseClasses =
      'flex-grow px-3 py-2 bg-transparent focus:outline-none text-sm';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} text-gray-200 placeholder-gray-400`;
      case 'admin':
        return `${baseClasses} text-gray-900 placeholder-gray-500`;
      case 'trainer':
      default:
        return `${baseClasses} text-gray-900 placeholder-gray-500`;
    }
  }

  getSearchButtonClasses(): string {
    const baseClasses =
      'text-sm font-semibold px-4 py-2 rounded-lg ml-2 transition-all duration-200 shadow-lg';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-blue-500/25`;
      case 'admin':
        return `${baseClasses} bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-gray-500/25`;
      case 'trainer':
      default:
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/25`;
    }
  }

  getSearchIconClasses(): string {
    switch (this.config.theme) {
      case 'user':
        return 'text-blue-200 group-hover:text-white';
      case 'admin':
        return 'text-gray-200 group-hover:text-white';
      case 'trainer':
      default:
        return 'text-red-200 group-hover:text-white';
    }
  }

  getLabelClasses(): string {
    const baseClasses = 'text-xs font-medium mb-1';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} text-gray-300`;
      case 'admin':
        return `${baseClasses} text-gray-600`;
      case 'trainer':
      default:
        return `${baseClasses} text-gray-600`;
    }
  }

  getSelectClasses(): string {
    const baseClasses = 'w-full rounded-lg focus:ring-2 text-sm';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} border-blue-500/30 bg-gray-800/50 text-gray-200 focus:ring-blue-500 focus:border-blue-500`;
      case 'admin':
        return `${baseClasses} border-gray-200 bg-white text-gray-900 focus:ring-gray-500 focus:border-gray-500`;
      case 'trainer':
      default:
        return `${baseClasses} border-gray-200 bg-white text-gray-900 focus:ring-red-500 focus:border-red-500`;
    }
  }

  getInputClasses(): string {
    const baseClasses = 'w-full rounded-lg focus:ring-2 text-sm';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} border-blue-500/30 bg-gray-800/50 text-gray-200 focus:ring-blue-500 focus:border-blue-500`;
      case 'admin':
        return `${baseClasses} border-gray-200 bg-white text-gray-900 focus:ring-gray-500 focus:border-gray-500`;
      case 'trainer':
      default:
        return `${baseClasses} border-gray-200 bg-white text-gray-900 focus:ring-red-500 focus:border-red-500`;
    }
  }

  getApplyButtonClasses(): string {
    const baseClasses =
      'group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold px-4 py-2 shadow-sm transition-colors';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white`;
      case 'admin':
        return `${baseClasses} bg-gray-600 hover:bg-gray-800 text-white`;
      case 'trainer':
      default:
        return `${baseClasses} bg-red-600 hover:bg-red-800 text-white`;
    }
  }

  getClearButtonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium px-4 py-2 transition-colors';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} border-blue-500/30 text-blue-300 hover:bg-blue-500/10`;
      case 'admin':
        return `${baseClasses} border-gray-300 text-gray-700 hover:bg-gray-50`;
      case 'trainer':
      default:
        return `${baseClasses} border-red-300 text-red-700 hover:bg-red-50`;
    }
  }

  getButtonIconClasses(): string {
    switch (this.config.theme) {
      case 'user':
        return 'text-blue-200 group-hover:text-white';
      case 'admin':
        return 'text-gray-200 group-hover:text-white';
      case 'trainer':
      default:
        return 'text-red-200 group-hover:text-white';
    }
  }

  getActiveFiltersLabelClasses(): string {
    const baseClasses = 'text-xs';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} text-gray-400`;
      case 'admin':
        return `${baseClasses} text-gray-500`;
      case 'trainer':
      default:
        return `${baseClasses} text-gray-500`;
    }
  }

  getActiveFilterChipClasses(): string {
    const baseClasses =
      'inline-flex items-center px-2 py-1 rounded-full text-xs';

    switch (this.config.theme) {
      case 'user':
        return `${baseClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      case 'admin':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'trainer':
      default:
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  }
}
