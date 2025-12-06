import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TestimonailService } from '../../core/services/testimonail.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { environment } from '../../../enviroments/environment';
import { ProductService } from '../../core/services/product.service';
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(private _authService:AuthService, private _testimonialService: TestimonailService
  , private _reportService: ReportService,private _productService: ProductService) {}
  ngOnInit(): void {
    this._authService.getUserData().subscribe(data => {
      if (data) {
        this.name = data.name;
      } else {
        this.name = '';
      }
    });

    this.loadApprovedTestimonials();
    this.loadBestSeller();
  }

  isAdmin() {
    return this._authService.isAuthenticateAdmin();
  }

  name = '';
  testimonials: any[] = [];
  loadingTestimonials: boolean = true;
  bestSellerProduct: any = null;
  loadingBestSeller: boolean = false;
  bestSellerError: string = '';
  bestSellerImageUrl: string = '';
  bestSellerOriginalPrice: number = 0;
  bestSellerDescription: string = '';

  loadApprovedTestimonials(): void {
    this.loadingTestimonials = true;
    this._testimonialService.getApprovedTestimonials().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.testimonials = response.data || [];
        }
        this.loadingTestimonials = false;
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.loadingTestimonials = false;
      }
    });
  }
loadBestSeller(): void {
    this.loadingBestSeller = true;
    this.bestSellerError = '';

this._reportService.getSalesReport().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.[0]?.topProducts?.[0]) {
          const bestSellerData = response.data[0].topProducts[0];

          this.bestSellerProduct = bestSellerData;
          this.loadProductDetails(bestSellerData._id);
      } else {
          this.bestSellerProduct = null;
          this.bestSellerError = 'No sales data available';
        }
        this.loadingBestSeller = false;
      },
      error: (error) => {
        console.error('Error loading best seller:', error);
        this.bestSellerError = 'Failed to load best seller';
        this.loadingBestSeller = false;
      }
    });
  }
 loadProductDetails(productId: string): void {
    this._productService.getProductById(productId).subscribe({
      next: (productResponse: any) => {
        if (productResponse.status === 'success' && productResponse.data) {
          const product = productResponse.data;
if (product.imgURL) {
            this.bestSellerImageUrl = `${environment.apiURL}/uploads/${product.imgURL}`;
          }
          this.bestSellerOriginalPrice = product.price;
          this.bestSellerDescription = product.description;
this.bestSellerProduct = {
            ...this.bestSellerProduct,
            imageUrl: this.bestSellerImageUrl,
            originalPrice: this.bestSellerOriginalPrice,
            description: this.bestSellerDescription,
            category: product.category?.name,
            stock: product.stock
          };

        } else {
          console.warn('Product details not found for ID:', productId);
        }
        this.loadingBestSeller = false;
      },
      error: (error) => {
        console.error('Error loading product details:', error);
this.loadingBestSeller = false;
      }
    });
  }

  getUserName(testimonial: any): string {
    if (!testimonial.user) return 'Anonymous';

    if (typeof testimonial.user === 'object') {
      return testimonial.user.name || 'Customer';
    }

    return 'Customer';
  }
getUserInitial(testimonial: any): string {
    const name = this.getUserName(testimonial);
    return name.charAt(0).toUpperCase();
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }
  getAveragePrice(): number {
    if (!this.bestSellerProduct || !this.bestSellerProduct.quantitySold || this.bestSellerProduct.quantitySold === 0) {
      return 0;
    }
    return this.bestSellerProduct.revenue / this.bestSellerProduct.quantitySold;
  }
  hasImage(): boolean {
    return !!this.bestSellerProduct?.imageUrl;
  }
}


