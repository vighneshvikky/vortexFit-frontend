import { Component, Input, OnInit } from '@angular/core';
import { Role } from '../enums/role.enum';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WalletService } from '../services/wallet.service';

interface TrasactionFilters {
  sourceType?: 'BOOKING' | 'SUBSCRIPTION';
  fromDate?: string;
  toDate?: string;
  userId?: string;
}

interface TransactionSummary {
  totalEarnings: number;
  totalExpenses: number;
  transactionCount: number;
}

@Component({
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
 @Input() role: Role = Role.User;
  @Input() filters: TrasactionFilters = {};
  @Input() showSummary: boolean = true;
  @Input() showFilters: boolean = true;
  @Input() pageSize: number = 10;

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

  // Role-based configurations
  roleConfig = {
    [Role.Admin]: {
      canViewAll: true,
      showEarnings: true,
      showExpenses: true,
      defaultFilters: {},
    },
    [Role.Trainer]: {
      canViewAll: false,
      showEarnings: true,
      showExpenses: true,
      defaultFilters: { sourceType: 'BOOKING' as const },
    },
    [Role.User]: {
      canViewAll: false,
      showEarnings: false,
      showExpenses: true,
      defaultFilters: {},
    },
  };

  private destroy$ = new Subject<void>();

  constructor(private transactionService: TransactionService, private walletService: WalletService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.walletService.getBalance().subscribe((res) => {
    this.balance = res.balance;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTransactions(): void {
    this.loading = true;
    this.error = null;

    const config = this.roleConfig[this.role];
    const mergedFilters = { ...config.defaultFilters, ...this.filters };

    const transactionRequest = config.canViewAll
      ? this.transactionService.getAllTransactions(mergedFilters)
      : this.transactionService.getUserTransactions(mergedFilters);

    const requests = [transactionRequest];

  
    if (config.showEarnings) {
    
    }
    if (config.showExpenses) {
      
    }

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.transactions = results[0] as Transaction[];
          this.filteredTransactions = [...this.transactions];
          this.updateSummary(results.slice(1));
          this.updatePagination();
          this.loading = false;
        }
      });
  }

  private updateSummary(summaryResults: any[]): void {
    let earningsIndex = 0;
    const config = this.roleConfig[this.role];

    if (config.showEarnings && summaryResults[earningsIndex]) {
      this.summary.totalEarnings = summaryResults[earningsIndex].total;
      earningsIndex++;
    }

    if (config.showExpenses && summaryResults[earningsIndex]) {
      this.summary.totalExpenses = summaryResults[earningsIndex].total;
    }

    this.summary.transactionCount = this.transactions.length;
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  // Public methods for filtering and pagination
  applyFilters(newFilters: TrasactionFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    this.loadTransactions();
  }

  filterByDateRange(fromDate: string, toDate: string): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return transactionDate >= from && transactionDate <= to;
    });
    this.updatePagination();
  }

  filterBySourceType(sourceType: 'BOOKING' | 'SUBSCRIPTION' | 'ALL'): void {
    if (sourceType === 'ALL') {
      this.filteredTransactions = [...this.transactions];
    } else {
      this.filteredTransactions = this.transactions.filter(
        transaction => transaction.sourceType === sourceType
      );
    }
    this.updatePagination();
  }

  searchTransactions(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredTransactions = [...this.transactions];
    } else {
      this.filteredTransactions = this.transactions.filter(transaction =>
        transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm)
      );
    }
    this.updatePagination();
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

  // Utility methods
  canShowEarnings(): boolean {
    return this.roleConfig[this.role].showEarnings;
  }

  canShowExpenses(): boolean {
    return this.roleConfig[this.role].showExpenses;
  }

  canViewAllTransactions(): boolean {
    return this.roleConfig[this.role].canViewAll;
  }

  getTransactionTypeLabel(sourceType: string): string {
    return sourceType === 'BOOKING' ? 'Booking' : 'Subscription';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }


  exportTransactions(): void {
    // Implement export functionality based on role permissions
    if (this.canViewAllTransactions()) {
      // Admin can export all transactions
      console.log('Exporting all transactions...');
    } else {
      // Users can only export their own transactions
      console.log('Exporting user transactions...');
    }
  }
}
