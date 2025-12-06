import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { IProduct, ICategory, ISubcategory } from '../../core/models/product.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  product: IProduct = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    subcategory: ''
  };
isEditMode: boolean = false;
  selectedProductId: string = '';
  selectedProductForEdit: any = null;
  originalProductData: any = null;
selectedSubcategory: string = '';
  newCategoryName: string = '';
  filteredSubcategories: ISubcategory[] = [];
  subcategoryExists: boolean = false;
  currentCategorySlug: string = '';
existingProducts: any[] = [];
  loadingProducts: boolean = false;

  categories: ICategory[] = [];
  allSubcategories: ISubcategory[] = [];
  selectedFile: File | null = null;
  productSlug?: string;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllSubcategories();
    this.loadExistingProducts();
this.productSlug = this.route.snapshot.params['slug'];
    if (this.productSlug) {
      this.isEditMode = true;
      this.loadProductForEdit(this.productSlug);
    }
  }
private getCategoryName(category: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category !== null) {
      return category.name || '';
    }
    return '';
  }

  private getSubcategoryName(subcategory: any): string {
    if (!subcategory) return '';
    if (typeof subcategory === 'string') return subcategory;
    if (typeof subcategory === 'object' && subcategory !== null) {
      return subcategory.name || '';
    }
    return '';
  }

  private getCategorySlugFromObject(category: any): string {
    if (!category) return '';
    if (typeof category === 'object' && category !== null) {
      return category.slug || '';
    }
    return '';
  }
switchToCreateMode(): void {
    this.isEditMode = false;
    this.resetCreateForm();
    this.selectedProductId = '';
    this.selectedProductForEdit = null;
    this.originalProductData = null;
  }

  switchToEditMode(): void {
    this.isEditMode = true;
    this.resetCreateForm();
    this.selectedProductId = '';
    this.selectedProductForEdit = null;
    this.originalProductData = null;
  }

 onProductSelect(): void {
    if (this.selectedProductId) {
      this.loadProductForEdit(this.selectedProductId);
    } else {
      this.selectedProductForEdit = null;
    }
  }

  startEditProduct(product: any): void {
    this.isEditMode = true;
    this.selectedProductId = product.slug;
    this.loadProductForEdit(product.slug);
setTimeout(() => {
      const formElement = document.querySelector('.product-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
loadProductForEdit(slug: string): void {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.selectedProductForEdit = res.data;
        this.originalProductData = { ...res.data };
this.product.name = res.data.name;
        this.product.price = res.data.price;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product for edit:', err);
        alert('Error loading product: ' + (err.error?.message || 'Please try again'));
        this.isLoading = false;
      }
    });
  }
  cancelEdit(): void {
    this.selectedProductId = '';
    this.selectedProductForEdit = null;
    this.originalProductData = null;
    this.product.name = '';
    this.product.price = 0;
  }

  loadExistingProducts(): void {
    this.loadingProducts = true;
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.existingProducts = res.data || [];
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading existing products:', err);
        this.loadingProducts = false;
      }
    });
  }


  deleteProduct(slug: string, productName: string): void {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    this.isSubmitting = true;
    this.productService.deleteProduct(slug).subscribe({
      next: () => {
        this.loadExistingProducts();
        if (this.selectedProductId === slug) {
          this.cancelEdit();
        }

        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        alert('Error: ' + (err.error?.message || 'Please try again'));
        this.isSubmitting = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
        },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadAllSubcategories(): void {
    this.productService.getAllSubcategories().subscribe({
      next: (res) => {
        this.allSubcategories = res.data;
        },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });
  }

  onCategoryChange(): void {
    if (this.product.category === 'new') {
      this.newCategoryName = '';
      this.filteredSubcategories = [];
      this.selectedSubcategory = '';
      this.product.subcategory = '';
      this.currentCategorySlug = '';
    } else if (this.product.category) {
      const category = this.categories.find(cat =>
        cat.name.toLowerCase() === this.product.category.toLowerCase()
      );

      if (category) {
        this.currentCategorySlug = category.slug;
        this.filterSubcategories();
      }
    }
  }

  private filterSubcategories(): void {
    if (!this.product.category || this.product.category === 'new') {
      this.filteredSubcategories = [];
      return;
    }

    this.filteredSubcategories = this.allSubcategories.filter(sub => {
      if (typeof sub.category === 'object' && sub.category !== null) {
        const categoryObj = sub.category as any;
        return categoryObj.name === this.product.category;
      }
      const category = this.categories.find(cat => cat.name === this.product.category);
      return category ? true : false;
    });

    }
onSubcategoryChange(): void {
    if (this.selectedSubcategory === 'new') {
      this.product.subcategory = '';
      this.subcategoryExists = false;
    } else if (this.selectedSubcategory) {
      this.product.subcategory = this.selectedSubcategory;
      this.subcategoryExists = false;
    }
  }
checkSubcategoryExists(): void {
    if (!this.product.subcategory || !this.product.category || this.product.category === 'new') {
      this.subcategoryExists = false;
      return;
    }

    const exists = this.filteredSubcategories.some(sub =>
      sub.name.toLowerCase() === this.product.subcategory.toLowerCase()
    );

    this.subcategoryExists = exists;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
private async ensureCategory(): Promise<string> {
    if (!this.product.category) {
      throw new Error('Category is required');
    }

    if (this.product.category === 'new') {
      if (!this.newCategoryName.trim()) {
        throw new Error('New category name is required');
      }
      try {
        const newCategory = await firstValueFrom(
          this.productService.createCategory({ name: this.newCategoryName })
        );
        this.categories.push(newCategory.data);
        this.product.category = this.newCategoryName;
        this.currentCategorySlug = newCategory.data.slug;
        return newCategory.data.slug;
      } catch (error: any) {
        throw new Error(`Failed to create category: ${error.error?.message || error.message}`);
      }
    }

    const category = this.categories.find(cat =>
      cat.name.toLowerCase() === this.product.category.toLowerCase()
    );

    if (!category) {
      throw new Error(`Category "${this.product.category}" not found`);
    }

    return category.slug;
  }

  private async ensureSubcategory(categorySlug: string): Promise<string> {
    if (!this.product.subcategory) {
      throw new Error('Subcategory is required');
    }

    if (this.selectedSubcategory && this.selectedSubcategory !== 'new') {
      const subcategory = this.filteredSubcategories.find(sub =>
        sub.name === this.selectedSubcategory
      );

      if (subcategory) {
        return subcategory.slug;
      }
    }

    try {
      const newSubcategory = await firstValueFrom(
        this.productService.createSubcategory({
          name: this.product.subcategory,
          categorySlug: categorySlug
        })
      );

      this.allSubcategories.push(newSubcategory.data);
      this.filteredSubcategories.push(newSubcategory.data);
      this.selectedSubcategory = this.product.subcategory;

      return newSubcategory.data.slug;
    } catch (error: any) {
      if (error.error?.message?.includes('already exists') || error.status === 400) {
        try {
          const allSubs = await firstValueFrom(this.productService.getAllSubcategories());
          this.allSubcategories = allSubs.data;
          this.filterSubcategories();

          const existingSub = this.filteredSubcategories.find(sub =>
            sub.name.toLowerCase() === this.product.subcategory.toLowerCase()
          );

          if (existingSub) {
            this.selectedSubcategory = this.product.subcategory;
            return existingSub.slug;
          }
        } catch (reloadError) {
          console.error('Failed to reload subcategories:', reloadError);
        }
      }

      throw new Error(`Failed to create subcategory: ${error.error?.message || error.message}`);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;

    if (!this.product.name || !this.product.price) {
      alert('Please fill all required fields (Name, Price)');
      return;
    }

    if (this.isEditMode) {
      if (!this.selectedProductForEdit) {
        alert('Please select a product to edit');
        return;
      }
    } else {
      if (!this.product.category) {
        alert('Please select a category');
        return;
      }

      if (this.product.category === 'new' && !this.newCategoryName) {
        alert('Please enter new category name');
        return;
      }

      if (!this.product.subcategory) {
        alert('Please select or enter a subcategory');
        return;
      }

      if (this.subcategoryExists) {
        alert('This subcategory already exists. Please choose a different name.');
        return;
      }

      if (!this.product.stock && this.product.stock !== 0) {
        alert('Please enter stock quantity');
        return;
      }
    }

    this.isSubmitting = true;

    try {
      if (this.isEditMode) {
        await this.updateProduct();
      } else {
        await this.createProduct();
      }
    } catch (error: any) {
      console.error('Error in onSubmit:', error);
      alert('Error: ' + error.message);
      this.isSubmitting = false;
    }
  }

  private async createProduct(): Promise<void> {
    try {
      const categorySlug = await this.ensureCategory();
      const subcategorySlug = await this.ensureSubcategory(categorySlug);

      const formData = new FormData();
      formData.append('name', this.product.name);
      formData.append('description', this.product.description);
      formData.append('price', this.product.price.toString());
      formData.append('stock', this.product.stock.toString());
      formData.append('categorySlug', categorySlug);
      formData.append('subcategorySlug', subcategorySlug);

      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }

      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.resetCreateForm();
          this.loadExistingProducts();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error creating product:', err);
          alert('Error: ' + (err.error?.message || 'Please try again'));
          this.isSubmitting = false;
        }
      });

    } catch (error: any) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  private async updateProduct(): Promise<void> {
    const categoryName = this.getCategoryName(this.selectedProductForEdit.category);
    const subcategoryName = this.getSubcategoryName(this.selectedProductForEdit.subcategory);

    const formData = new FormData();
formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('description', this.selectedProductForEdit.description || '');
    formData.append('stock', (this.selectedProductForEdit.stock || 0).toString());
const category = this.categories.find(cat =>
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (category) {
      formData.append('categorySlug', category.slug);
const subcategory = this.allSubcategories.find(sub =>
        sub.name.toLowerCase() === subcategoryName.toLowerCase()
      );

      if (subcategory) {
        formData.append('subcategorySlug', subcategory.slug);
      } else {
        formData.append('subcategorySlug', subcategoryName);
      }
    } else {
      formData.append('categorySlug', categoryName);
      formData.append('subcategorySlug', subcategoryName);
    };
      this.productService.updateProduct(this.selectedProductId, formData).subscribe({
      next: () => {
        this.loadExistingProducts();
        this.cancelEdit();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('Error: ' + (err.error?.message || 'Please try again'));
        this.isSubmitting = false;
      }
    });
  }
private resetCreateForm(): void {
    this.product = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      subcategory: ''
    };
    this.selectedSubcategory = '';
    this.newCategoryName = '';
    this.selectedFile = null;
    this.filteredSubcategories = [];
    this.subcategoryExists = false;
    this.currentCategorySlug = '';
  }

  cancel(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
