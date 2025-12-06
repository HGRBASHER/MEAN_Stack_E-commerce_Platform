export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  imgURL?: string;
  stock: number;
  category: string;
  subcategory: string;
  slug?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  isDeleted?: boolean;
}

export interface ISubcategory {
  _id?: string;
  name: string;
  slug: string;
  category: string;
  isDeleted?: boolean;
}

export interface IProductResponse {
  status: string;
  data: IProduct;
  message?: string;
}

export interface IProductsResponse {
  status: string;
  data: IProduct[];
}

export interface ICategoriesResponse {
  status: string;
  data: ICategory[];
}

export interface ISubcategoriesResponse {
  status: string;
  data: ISubcategory[];
}

export interface ICategoriesWithSubcategoriesResponse {
  status: string;
  data: {
    _id: string;
    name: string;
    slug: string;
    subcategories: ISubcategory[];
  }[];
}
