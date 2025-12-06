import { Injectable } from '@angular/core';
import {IProductResponse,IProductsResponse,IProduct,ICategory,ICategoriesResponse,ISubcategory,ISubcategoriesResponse} from '../models/product.model';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private _http: HttpClient,
    private authService: AuthService
  ) {}

  apiURL = environment.apiURL + '/product';
  categoryURL = environment.apiURL + '/category';
  subcategoryURL = environment.apiURL + '/subcategory';

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });
    }
    return new HttpHeaders();
  }

  getAllProducts(): Observable<IProductsResponse> {
    return this._http.get<IProductsResponse>(this.apiURL);
  }

  getProductBySlug(slug: string): Observable<IProductResponse> {
    return this._http.get<IProductResponse>(this.apiURL + '/' + slug);
  }

  getRelatedProducts(slug: string): Observable<IProductsResponse> {
    return this._http.get<IProductsResponse>(this.apiURL + '/relatedproducts/' + slug);
  }

  createProduct(productData: FormData): Observable<IProductResponse> {
    return this._http.post<IProductResponse>(this.apiURL, productData, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(slug: string, productData: FormData): Observable<IProductResponse> {
    return this._http.put<IProductResponse>(this.apiURL + '/' + slug, productData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(slug: string): Observable<any> {
    return this._http.delete(this.apiURL + '/' + slug, {
      headers: this.getAuthHeaders()
    });
  }

  getAllCategories(): Observable<ICategoriesResponse> {
    return this._http.get<ICategoriesResponse>(this.categoryURL);
  }
  getAllSubcategories(): Observable<ISubcategoriesResponse> {
    return this._http.get<ISubcategoriesResponse>(this.subcategoryURL);
  }

  getSubcategoriesByCategory(categorySlug: string): Observable<ISubcategoriesResponse> {
    return this._http.get<ISubcategoriesResponse>(`${this.subcategoryURL}?category=${categorySlug}`);
  }
  createCategory(categoryData: { name: string }): Observable<any> {
    return this._http.post(this.categoryURL, categoryData, {
      headers: this.getAuthHeaders()
    });
  }
  createSubcategory(subcategoryData: { name: string; categorySlug: string }): Observable<any> {
    return this._http.post(this.subcategoryURL, subcategoryData, {
      headers: this.getAuthHeaders()
    });
  }
  findCategoryByName(name: string): Observable<ICategoriesResponse> {
    return this._http.get<ICategoriesResponse>(this.categoryURL);
  }  findSubcategoryByName(name: string, categorySlug: string): Observable<ISubcategoriesResponse> {
    return this._http.get<ISubcategoriesResponse>(this.subcategoryURL);
  }
getProductById(id: string): Observable<IProductResponse> {
 return this._http.get<IProductResponse>(`${this.apiURL}/id/${id}`);
}}
