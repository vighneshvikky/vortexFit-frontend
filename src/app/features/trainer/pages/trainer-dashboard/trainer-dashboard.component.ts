import { Component } from '@angular/core';
import { BookingStatusBreakdown, DashboardStats, MonthlyRevenue, RecentBooking, RevenueBreakdown, TrainerDashboardService } from '../../services/trainerDashboard.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import {BaseChartDirective} from 'ng2-charts'

Chart.register(...registerables);
@Component({
  selector: 'app-trainer-dashboard',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './trainer-dashboard.component.html',
  styleUrl: './trainer-dashboard.component.scss',
})
export class TrainerDashboardComponent {
 stats: DashboardStats | null = null;
  revenueBreakdown: RevenueBreakdown[] = [];
  bookingStatusBreakdown: BookingStatusBreakdown[] = [];
  monthlyRevenue: MonthlyRevenue[] = [];
  recentBookings: RecentBooking[] = [];
  loading = true;
  error: string | null = null;

  // Chart data
  revenueChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
    }],
  };
  
  bookingStatusChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#991b1b', '#dc2626', '#ef4444', '#f87171'],
    }],
  };
  
  monthlyRevenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  // Chart options
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fca5a5',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fca5a5',
        bodyColor: '#fff',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
    },
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fca5a5',
        bodyColor: '#fff',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fca5a5',
        },
        grid: {
          color: 'rgba(220, 38, 38, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#fca5a5',
        },
        grid: {
          color: 'rgba(220, 38, 38, 0.1)',
        },
      },
    },
  };

  constructor(private dashboardService: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      stats: this.dashboardService.getDashboardStats(),
      revenue: this.dashboardService.getRevenueData(),
      bookingStatus: this.dashboardService.getBookingStatusBreakdown(),
      monthlyRevenue: this.dashboardService.getMonthlyRevenue(),
      recentBookings: this.dashboardService.getRecentBookings(),
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.revenueBreakdown = data.revenue;
        this.bookingStatusBreakdown = data.bookingStatus;
        this.monthlyRevenue = data.monthlyRevenue;
        this.recentBookings = data.recentBookings;

        this.prepareChartData();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Dashboard error:', err);
      },
    });
  }

  prepareChartData(): void {
    // Revenue breakdown pie chart
    if (this.revenueBreakdown.length > 0) {
      this.revenueChartData = {
        labels: this.revenueBreakdown.map(item => item.type),
        datasets: [{
          data: this.revenueBreakdown.map(item => item.total),
          backgroundColor: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
        }],
      };
    }

    // Booking status pie chart
    if (this.bookingStatusBreakdown.length > 0) {
      this.bookingStatusChartData = {
        labels: this.bookingStatusBreakdown.map(item => item.status),
        datasets: [{
          data: this.bookingStatusBreakdown.map(item => item.count),
          backgroundColor: ['#991b1b', '#dc2626', '#ef4444', '#f87171'],
        }],
      };
    }

    // Monthly revenue line chart
    if (this.monthlyRevenue.length > 0) {
      this.monthlyRevenueChartData = {
        labels: this.monthlyRevenue.map(item => this.formatMonth(item.month)),
        datasets: [{
          label: 'Revenue',
          data: this.monthlyRevenue.map(item => item.revenue),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      };
    }
  }

  formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  }
}
