import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AdminDashboardService } from '../../services/adminDashboard.service';
import { firstValueFrom } from 'rxjs';

Chart.register(...registerables);

interface DashboardStats {
  users: { total: number; newThisMonth: number };
  trainers: { total: number };
  bookings: { total: number };
  subscriptions: { total: number };
  revenue: { total: number; monthly: number };
}

interface RevenueAnalytics {
  bySource: Array<{ source: string; total: number; count: number }>;
  monthlyTrend: Array<{ month: string; total: number; count: number }>;
  byPlan: Array<{ planName: string; total: number; count: number }>;
}

interface BookingAnalytics {
  byStatus: Array<{ status: string; count: number }>;
  topTrainers: Array<{
    trainerId: string;
    trainerName: string;
    trainerEmail: string;
    bookingCount: number;
    totalRevenue: number;
  }>;
}

interface SubscriptionAnalytics {
  byPlan: Array<{ planName: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  activeVsExpired: Array<{ status: string; count: number }>;
}

interface UserAnalytics {
  total: number;
  newThisMonth: number;
  byFitnessGoals: Array<{ goal: string; count: number }>;
  byFitnessLevel: Array<{ level: string; count: number }>;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  dashboardStats: DashboardStats | null = null;
  revenueAnalytics: RevenueAnalytics | null = null;
  bookingAnalytics: BookingAnalytics | null = null;
  subscriptionAnalytics: SubscriptionAnalytics | null = null;
  userAnalytics: UserAnalytics | null = null;

  loading = true;
  error: string | null = null;

  private charts: { [key: string]: Chart } = {};

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const [stats, revenue, bookings, subscriptions, users] =
        await Promise.all([
          firstValueFrom(this.adminDashboardService.getDashboardStats()),
          firstValueFrom(this.adminDashboardService.getRevenueAnalytics()),
          firstValueFrom(this.adminDashboardService.getBookingAnalytics()),
          firstValueFrom(this.adminDashboardService.getSubscriptionAnalytics()),
          firstValueFrom(this.adminDashboardService.getUserAnalytics()),
        ]);

      this.dashboardStats = stats;
      this.revenueAnalytics = revenue;
      this.bookingAnalytics = bookings;
      this.subscriptionAnalytics = subscriptions;
      this.userAnalytics = users;

      setTimeout(() => this.createCharts(), 0);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  private createCharts(): void {
    this.createRevenueBySourceChart();
    this.createBookingStatusChart();
    this.createSubscriptionPlanChart();
    this.createUserFitnessGoalsChart();
    this.createMonthlyRevenueChart();
    this.createActiveSubscriptionsChart();
  }

  private createRevenueBySourceChart(): void {
    const canvas = document.getElementById(
      'revenueSourceChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.revenueAnalytics?.bySource.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['revenueSource']) {
      this.charts['revenueSource'].destroy();
    }

    this.charts['revenueSource'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.revenueAnalytics.bySource.map(
          (s) => s.source || 'Unknown'
        ),
        datasets: [
          {
            data: this.revenueAnalytics.bySource.map((s) => s.total),
            backgroundColor: [
              '#8b5cf6',
              '#ec4899',
              '#06b6d4',
              '#10b981',
              '#f59e0b',
              '#ef4444',
            ],
            borderWidth: 2,
            borderColor: '#1e293b',
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
              color: '#cbd5e1',
              padding: 15,
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: 'Revenue by Source',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    });
  }

  private createBookingStatusChart(): void {
    const canvas = document.getElementById(
      'bookingStatusChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.bookingAnalytics?.byStatus.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['bookingStatus']) {
      this.charts['bookingStatus'].destroy();
    }

    this.charts['bookingStatus'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.bookingAnalytics.byStatus.map((s) => s.status),
        datasets: [
          {
            data: this.bookingAnalytics.byStatus.map((s) => s.count),
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#06b6d4',
            ],
            borderWidth: 2,
            borderColor: '#1e293b',
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
              color: '#cbd5e1',
              padding: 15,
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: 'Bookings by Status',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    });
  }

  private createSubscriptionPlanChart(): void {
    const canvas = document.getElementById(
      'subscriptionPlanChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.subscriptionAnalytics?.byPlan.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['subscriptionPlan']) {
      this.charts['subscriptionPlan'].destroy();
    }

    this.charts['subscriptionPlan'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.subscriptionAnalytics.byPlan.map((s) => s.planName),
        datasets: [
          {
            data: this.subscriptionAnalytics.byPlan.map((s) => s.count),
            backgroundColor: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
            borderWidth: 2,
            borderColor: '#1e293b',
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
              color: '#cbd5e1',
              padding: 15,
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: 'Subscriptions by Plan',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    });
  }

  private createUserFitnessGoalsChart(): void {
    const canvas = document.getElementById(
      'fitnessGoalsChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.userAnalytics?.byFitnessGoals.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['fitnessGoals']) {
      this.charts['fitnessGoals'].destroy();
    }

    this.charts['fitnessGoals'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.userAnalytics.byFitnessGoals.map((g) => g.goal),
        datasets: [
          {
            data: this.userAnalytics.byFitnessGoals.map((g) => g.count),
            backgroundColor: [
              '#ec4899',
              '#8b5cf6',
              '#06b6d4',
              '#10b981',
              '#f59e0b',
              '#ef4444',
            ],
            borderWidth: 2,
            borderColor: '#1e293b',
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
              color: '#cbd5e1',
              padding: 15,
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: 'User Fitness Goals',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    });
  }

  private createMonthlyRevenueChart(): void {
    const canvas = document.getElementById(
      'monthlyRevenueChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.revenueAnalytics?.monthlyTrend.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['monthlyRevenue']) {
      this.charts['monthlyRevenue'].destroy();
    }

    this.charts['monthlyRevenue'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueAnalytics.monthlyTrend.map((m) => m.month),
        datasets: [
          {
            label: 'Revenue',
            data: this.revenueAnalytics.monthlyTrend.map((m) => m.total),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Monthly Revenue Trend',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#334155',
            },
            ticks: {
              color: '#cbd5e1',
            },
          },
          x: {
            grid: {
              color: '#334155',
            },
            ticks: {
              color: '#cbd5e1',
            },
          },
        },
      },
    });
  }

  private createActiveSubscriptionsChart(): void {
    const canvas = document.getElementById(
      'activeSubscriptionsChart'
    ) as HTMLCanvasElement;
    if (!canvas || !this.subscriptionAnalytics?.activeVsExpired.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.charts['activeSubscriptions']) {
      this.charts['activeSubscriptions'].destroy();
    }

    this.charts['activeSubscriptions'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.subscriptionAnalytics.activeVsExpired.map((s) => s.status),
        datasets: [
          {
            data: this.subscriptionAnalytics.activeVsExpired.map(
              (s) => s.count
            ),
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderColor: '#1e293b',
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
              color: '#cbd5e1',
              padding: 15,
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: 'Active vs Expired',
            color: '#f1f5f9',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  ngOnDestroy(): void {
    // Clean up all charts
    Object.values(this.charts).forEach((chart) => chart.destroy());
  }
}
