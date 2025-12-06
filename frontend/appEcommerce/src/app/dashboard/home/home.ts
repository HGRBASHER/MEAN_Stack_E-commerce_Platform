import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  startDate: string = '';
  endDate: string = '';
  dateError: string = '';
  loading: boolean = false;
  reportData: any = null;
  errorMessage: string = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
  }

  validateDates(): boolean {
    if (!this.startDate && !this.endDate) {
        this.dateError = 'At least one date is required';
        return false;
    }
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (start > end) {
            this.dateError = 'Start date cannot be after end date';
            return false;
        }
    }

    this.dateError = '';
    return true;
}

  generateReport(): void {
    if (!this.validateDates()) return;

    this.loading = true;
    this.errorMessage = '';

    this.reportService.getSalesReport(this.startDate, this.endDate).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.reportData = response.data[0];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.errorMessage = error.error?.message || 'Failed to generate report';
        this.loading = false;
      }
    });
  }

  exportReport(format: 'pdf' | 'excel'): void {
    if (!this.validateDates()) return;

    this.reportService.exportReport(format, this.startDate, this.endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${this.startDate}-to-${this.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.errorMessage = 'Failed to export report';
      }
    });
  }

  resetFilters(): void {
    this.setDefaultDates();
    this.reportData = null;
    this.errorMessage = '';
    this.dateError = '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
getAverageOrder(): number {
    if (!this.reportData?.overallStats?.[0]) return 0;
    const stats = this.reportData.overallStats[0];
    return stats.totalSalesAmount / (stats.totalOrders || 1);
  }
}
