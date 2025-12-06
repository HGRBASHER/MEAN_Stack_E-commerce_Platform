import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { IProduct, ICategory, ISubcategory } from '../../core/models/product.model';
import { environment } from '../../../enviroments/environment';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
@Component({
  selector: 'app-product-details',
  imports: [RouterLink,CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  product!: IProduct;
  relatedProducts!: IProduct[];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  slug!: string | null;
  staticURL = environment.staticFiles;

  constructor(
    private _productService: ProductService,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();

    this._activatedRoute.paramMap.subscribe(params => {
      const mySlug = params.get('slug');
      if (mySlug) {
        this.slug = mySlug;
        this.loadProduct(mySlug);
        this.loadRelatedProducts(mySlug);
      }
    });
  }

  loadProduct(slug: string): void {
    this._productService.getProductBySlug(slug).subscribe(res => {
      this.product = res.data;
      });
  }

  loadRelatedProducts(slug: string): void {
    this._productService.getRelatedProducts(slug).subscribe(res => {
      this.relatedProducts = res.data;
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
getShortDescription(description: string | undefined): string {
    if (!description) return 'No description available';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }
}
