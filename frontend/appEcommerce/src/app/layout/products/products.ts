import { Component, OnInit } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { IProduct ,ICategory, ISubcategory } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-products',
  imports: [RouterLink,RouterLinkActive,CommonModule,FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
  standalone: true,
})
export class Products implements OnInit {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  staticURL = environment.staticFiles;
  selectedCategory: string = '';
  selectedSubcategory: string = '';
  searchTerm: string = '';

  constructor(private _productService: ProductService ,private  _cartService: CartService ,private _authService:AuthService,private _router:Router) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadSubcategories();
  }

  loadProducts(): void {
    this._productService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res.data;
        this.filteredProducts = this.products;
        },
      error: (err) => {
        console.log('Error loading products:', err);
      },
    });
  }

  loadCategories(): void {
    this._productService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
      error: (err) => {
        console.log('Error loading categories:', err);
      }
    });
  }

  loadSubcategories(): void {
    this._productService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subcategories = res.data;
      },
      error: (err) => {
        console.log('Error loading subcategories:', err);
      }
    });
  }
getFilteredSubcategories(): ISubcategory[] {
    if (!this.selectedCategory) return [];

    const category = this.categories.find(cat => cat._id === this.selectedCategory);
    if (!category) return [];

    return this.subcategories.filter(sub => {
      const subCategoryId = this.getCategoryIdFromSubcategory(sub);
      return subCategoryId === category._id;
    });
  }
private getCategoryIdFromSubcategory(subcategory: ISubcategory): string {
    if (typeof subcategory.category === 'object' && subcategory.category !== null) {
      return (subcategory.category as any)._id;
    }
    return subcategory.category as string;
  }
getCategoryName(product: IProduct): string {
    if (typeof product.category === 'object' && product.category !== null) {
      return (product.category as any).name || 'Unknown Category';
    }
const category = this.categories.find(cat => cat._id === product.category);
    return category?.name || 'Unknown Category';
  }
getSubcategoryName(product: IProduct): string {
    if (typeof product.subcategory === 'object' && product.subcategory !== null) {
      return (product.subcategory as any).name || 'Unknown Subcategory';
    }
const subcategory = this.subcategories.find(sub => sub._id === product.subcategory);
    return subcategory?.name || 'Unknown Subcategory';
  }
getCategoryId(product: IProduct): string {
    if (typeof product.category === 'object' && product.category !== null) {
      return (product.category as any)._id;
    }
    return product.category as string;
  }
getSubcategoryId(product: IProduct): string {
    if (typeof product.subcategory === 'object' && product.subcategory !== null) {
      return (product.subcategory as any)._id;
    }
    return product.subcategory as string;
  }
applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const categoryMatch = !this.selectedCategory ||
        this.getCategoryId(product) === this.selectedCategory;
const subcategoryMatch = !this.selectedSubcategory ||
        this.getSubcategoryId(product) === this.selectedSubcategory;
      const searchMatch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return categoryMatch && subcategoryMatch && searchMatch;
    });
  }
  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.searchTerm = '';
    this.filteredProducts = this.products;
  }
onCategoryChange(): void {
    this.selectedSubcategory = '';
    this.applyFilters();
  }
getCategoryNameById(categoryId: string): string {
    const category = this.categories.find(cat => cat._id === categoryId);
    return category?.name || categoryId;
  }

  getSubcategoryNameById(subcategoryId: string): string {
    const subcategory = this.subcategories.find(sub => sub._id === subcategoryId);
    return subcategory?.name || subcategoryId;
  }


addToCart(product: IProduct): void {
    if (!product._id) {
    console.error('Product ID is missing');
    return;
  }
  if (this._authService.isAuthenticateAdmin() === true) {
    return;
  }
  if (!this._authService.isAuthenticateUser() === true) {
    this._router.navigate(['/login']);
    return;
  }
this._cartService.addToCart(product._id, 1).subscribe({
    next: () => {
      },
    error: (error) => {
      console.error('Error adding to cart:', error);
      if (error.status === 401) {
        console.error('User is not logged in');
      } else {
        console.error('Error adding product to cart. Please try again.');
      }
    }
  });
  }
}
