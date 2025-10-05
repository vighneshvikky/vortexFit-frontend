import { Component, Input, OnInit } from '@angular/core';
import { Role } from '../enums/role.enum';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WalletService } from '../services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
interface RevenueData {
  period: string;
  amount: number;
  count: number;
}
interface TransactionFilters {
  sourceType?: 'BOOKING' | 'SUBSCRIPTION';
  fromDate?: string;
  toDate?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

interface TransactionSummary {
  totalEarnings: number;
  totalExpenses: number;
  transactionCount: number;
}

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  role!: Role;
  @Input() filters: TransactionFilters = {};
  @Input() showSummary: boolean = true;
  @Input() showFilters: boolean = true;
  @Input() pageSize: number = 3;

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  summary: TransactionSummary = {
    totalEarnings: 0,
    totalExpenses: 0,
    transactionCount: 0,
  };
  balance: number = 0;
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;

  filterForm = {
    sourceType: 'ALL' as 'BOOKING' | 'SUBSCRIPTION' | 'ALL',
    fromDate: '',
    toDate: '',
    searchTerm: '',
    sortBy: 'createdAt' as 'createdAt' | 'amount',
    sortOrder: 'desc' as 'asc' | 'desc',
  };

  revenueByPeriod: RevenueData[] = [];
  selectedPeriod: 'day' | 'week' | 'month' = 'month';

  roleConfig = {
    [Role.Admin]: {
      canViewAll: true,
      showEarnings: true,
      showExpenses: true,
      showRevenue: true,
      defaultFilters: {},
    },
    [Role.Trainer]: {
      canViewAll: false,
      showEarnings: true,
      showExpenses: true,
      showRevenue: true,
      defaultFilters: { sourceType: 'BOOKING' as const },
    },
    [Role.User]: {
      canViewAll: false,
      showEarnings: false,
      showExpenses: true,
      showRevenue: false,
      defaultFilters: {},
    },
  };

  private destroy$ = new Subject<void>();

  constructor(
    private transactionService: TransactionService,
    private walletService: WalletService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'];
    this.initializeFilters();
    this.loadTransactions();

    if (this.role === Role.User) {
      this.loadWalletBalance();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters(): void {
    const config = this.roleConfig[this.role];
    if (config.showRevenue) {
      const now = new Date();

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      this.filterForm.fromDate = oneMonthAgo.toISOString().split('T')[0];
      this.filterForm.toDate = now.toISOString().split('T')[0];
    }
  }

  loadWalletBalance(): void {
    this.walletService
      .getBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.balance = res.balance;
        },
        error: (err) => {
          console.error('Error loading wallet balance:', err);
        },
      });
  }

  private loadTransactions(): void {
    this.loading = true;
    this.error = null;

    const config = this.roleConfig[this.role];
    const mergedFilters = { ...config.defaultFilters, ...this.filters };

    if (this.filterForm.fromDate) {
      mergedFilters.fromDate = this.filterForm.fromDate;
    }
    if (this.filterForm.toDate) {
      mergedFilters.toDate = this.filterForm.toDate;
    }
    if (this.filterForm.sourceType !== 'ALL') {
      mergedFilters.sourceType = this.filterForm.sourceType;
    }

    const transactionRequest = config.canViewAll
      ? this.transactionService.getAllTransactions(mergedFilters)
      : this.transactionService.getUserTransactions(mergedFilters);

    transactionRequest.pipe(takeUntil(this.destroy$)).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.applyLocalFilters();
        this.updateSummary();
        this.updatePagination();

        if (config.showRevenue) {
          this.calculateRevenueBrBreakdown();
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions. Please try again.';
        this.loading = false;
        console.error('Error loading transactions:', err);
      },
    });
  }

  private applyLocalFilters(): void {
    let filtered = [...this.transactions];
    if (this.filterForm.searchTerm) {
      const term = this.filterForm.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.fromUser?.name?.toLowerCase().includes(term) ||
          t.sourceType.toLowerCase().includes(term) ||
          t.paymentId?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      const aVal =
        this.filterForm.sortBy === 'createdAt'
          ? new Date(a.createdAt).getTime()
          : a.amount;
      const bVal =
        this.filterForm.sortBy === 'createdAt'
          ? new Date(b.createdAt).getTime()
          : b.amount;

      return this.filterForm.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    this.filteredTransactions = filtered;
  }

  private updateSummary(): void {}

  private calculateRevenueBrBreakdown(): void {
    const grouped = new Map<string, { amount: number; count: number }>();

    this.transactions.forEach((transaction) => {
      if (transaction.amount <= 0) return;

      const date = new Date(transaction.createdAt);
      let key: string;

      switch (this.selectedPeriod) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { amount: 0, count: 0 });
      }

      const data = grouped.get(key)!;
      data.amount += transaction.amount;
      data.count += 1;
    });

    this.revenueByPeriod = Array.from(grouped.entries())
      .map(([period, data]) => ({
        period: this.formatPeriodLabel(period),
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private formatPeriodLabel(period: string): string {
    switch (this.selectedPeriod) {
      case 'day':
        return new Date(period).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'week':
        return `Week of ${new Date(period).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
      case 'month':
        const [year, month] = period.split('-');
        return new Date(+year, +month - 1).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
      default:
        return period;
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize
    );
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  onLocalFilterChange(): void {
    this.currentPage = 1;
    this.applyLocalFilters();
    this.updatePagination();
  }

  onPeriodChange(): void {
    this.calculateRevenueBrBreakdown();
  }

  resetFilters(): void {
    this.filterForm = {
      sourceType: 'ALL',
      fromDate: '',
      toDate: '',
      searchTerm: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    this.initializeFilters();
    this.loadTransactions();
  }

  exportTransactions(): void {
    const csv = this.convertToCSV(this.filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString()}.csv`;
    link.click();
  }

  private convertToCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Name', 'Type', 'Amount', 'Currency', 'Status'];
    const rows = transactions.map((t) => [
      t.createdAt,
      t.fromUser?.name || 'N/A',
      t.sourceType,
      t.amount,
      t.currency,
      t.paymentSignature ? 'Completed' : 'Pending',
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  // Pagination methods
  getPaginatedTransactions(): Transaction[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTransactions.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Helper methods
  canShowEarnings(): boolean {
    return this.roleConfig[this.role].showEarnings;
  }

  canShowExpenses(): boolean {
    return this.roleConfig[this.role].showExpenses;
  }

  canShowRevenue(): boolean {
    return this.roleConfig[this.role].showRevenue;
  }

  canViewAllTransactions(): boolean {
    return this.roleConfig[this.role].canViewAll;
  }

  getTransactionTypeLabel(sourceType: string): string {
    return sourceType === 'BOOKING' ? 'Booking' : 'Subscription';
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('INR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('INR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get Role() {
    return Role;
  }
}
