import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { UserDashboardService } from '../../services/user-statistics.service';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

Chart.register(...registerables);

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  hasActiveSubscription: boolean;
  subscriptionName: string | null;
  walletBalance: number;
  totalSpent: number;
}

interface SpendingSummary {
  bookingSpent: number;
  subscriptionSpent: number;
  totalSpent: number;
}

interface Booking {
  _id: string;
  date: string;
  timeSlot: string;
  status: string;
  amount: number;
  trainerId: { name: string };
}

interface Transaction {
  _id: string;
  amount: number;
  sourceType: string;
  createdAt: Date;
  toUser: { name: string };
}

@Component({
  selector: 'app-user-profile-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile-dashboard.component.html',
  styleUrl: './user-profile-dashboard.component.scss',
})
export class UserProfileDashboardComponent {
  stats: DashboardStats | undefined;
  spendingSummary: SpendingSummary | undefined;
  recentBookings: Booking[] | undefined = [];
  recentTransactions: Transaction[] | undefined = [];
  loading = true;
  private chart: Chart | null = null;

  constructor(private dashboardService: UserDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      stats: this.dashboardService.getDashboardStats(),
      spendingSummary: this.dashboardService.getSpendingSummary(),
      recentBookings: this.dashboardService.getRecentBookings(),
      recentTransactions: this.dashboardService.getRecentTransactions(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result: any) => {
          console.log('any', result)
          this.stats = result.stats;
          this.spendingSummary = result.spendingSummary;
          this.recentBookings = result.recentBookings;
          this.recentTransactions = result.recentTransactions;

          // wait a bit to ensure DOM is ready before drawing chart
          setTimeout(() => this.createSpendingChart(), 100);
        },
      });
  }

  createSpendingChart(): void {
    const canvas = document.getElementById(
      'spendingChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.spendingSummary) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Bookings', 'Subscriptions'],
        datasets: [
          {
            data: [
              this.spendingSummary.bookingSpent,
              this.spendingSummary.subscriptionSpent,
            ],
            backgroundColor: ['#3b82f6', '#f97316'],
            borderColor: ['#2563eb', '#ea580c'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 15,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ₹${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(canvas, config);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusMap[status.toLowerCase()] || 'status-pending';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
