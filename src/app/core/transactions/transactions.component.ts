import { Component, Input, OnInit } from '@angular/core';
import { Role } from '../enums/role.enum';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WalletService } from '../services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
interface RevenueData {
  period: string;
  amount: number;
  count: number;
}
interface TransactionFilters {
  sourceType?: 'BOOKING' | 'SUBSCRIPTION' | 'ALL';
  fromDate?: string;
  toDate?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface transactionsData {
  transactions: Transaction[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface TransactionSummary {
  totalEarnings: number;
  totalExpenses: number;
  transactionCount: number;
}

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  role!: Role;
  @Input() filters: TransactionFilters = {};
  @Input() showSummary: boolean = true;
  @Input() showFilters: boolean = true;

  filteredTransactions: Transaction[] = [];
  summary: TransactionSummary = {
    totalEarnings: 0,
    totalExpenses: 0,
    transactionCount: 0,
  };
  balance: number = 0;
  error: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 3;
  totalTransactions: number = 0;
  transactionsData: Transaction[] =  [];
  earnings: number = 0;
  loading: boolean = false;
  filterForm: TransactionFilters = {
    sourceType: 'ALL',
    fromDate: '',
    toDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
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
      defaultFilters: { sourceType: 'BOOKING' as const },
    },
  };

  private destroy$ = new Subject<void>();
  private filterChange$ = new Subject<TransactionFilters>();

  constructor(
    private transactionService: TransactionService,
    private walletService: WalletService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'];
  this.filterChange$
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        console.log('Filter changed, loading transactions...', filters);
        this.currentPage = 1;
        this.loadTransactions();
      });
    this.loadTransactions();

    if (this.role === Role.User) {
      this.loadWalletBalance();
    }else{
     this.loadEarnings()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEarnings(){
    this.transactionService.getEarnings().subscribe({
      next: (res) => {
       this.earnings = Number(res)
      }
    })
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

   loadTransactions(): void {
    this.loading = true;
    this.error = null;
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.filterForm.sourceType && this.filterForm.sourceType !== 'ALL') {
      params.sourceType = this.filterForm.sourceType;
    }

    if (this.filterForm.fromDate) {
      params.fromDate = this.filterForm.fromDate;
    }

    if (this.filterForm.toDate) {
      params.toDate = this.filterForm.toDate;
    }

    if (this.filterForm.sortBy) {
      params.sortBy = this.filterForm.sortBy;
    }

    if (this.filterForm.sortOrder) {
      params.sortOrder = this.filterForm.sortOrder;
    }

    console.log('Loading transactions with params:', params);

    this.transactionService
      .getUserTransactions(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: transactionsData) => {
          this.transactionsData = response.transactions || [];
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.totalTransactions = response.total;
          this.loading = false;

          console.log('Transactions loaded:', response);
        },
        error: (err) => {
       console.error('Error loading transactions:', err);
          this.error = 'Failed to load transactions. Please try again.';
          this.loading = false;
          this.transactionsData = []; 
          this.totalPages = 1;
          this.totalTransactions = 0;
        },
      });
  }

  onFilterChange(): void {
      console.log('Filter change triggered', this.filterForm);
    this.filterChange$.next({ ...this.filterForm });
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  onPeriodChange(): void {
    // Implement revenue breakdown logic if needed
    console.log('Period changed to:', this.selectedPeriod);
  }
  resetFilters(): void {
    this.filterForm = {
      sourceType: 'ALL',
      fromDate: '',
      toDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    this.currentPage = 1;
    this.loadTransactions();
  }

  exportTransactions(): void {
    
    const csv = this.convertToCSV(this.transactionsData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(transactions: Transaction[]): string {
    const headers = [
      'Date',
      'From User',
      'To User',
      'Type',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
    ];

    const rows = transactions.map((t) => [
      new Date(t.createdAt).toLocaleString(),
      t.fromUser?.name || 'N/A',
      t.toUser?.name || 'N/A',
      t.sourceType,
      t.amount,
      t.currency,
      t.bookingMethod || 'N/A',
      t.isCancelled
        ? 'Cancelled'
        : t.paymentSignature
        ? 'Completed'
        : 'Pending',
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  }

  private scrollToTable(): void {
    const tableElement = document.querySelector(
      '.transactions-table-container'
    );
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTransactions();
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
