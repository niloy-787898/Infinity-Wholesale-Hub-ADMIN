import {Category} from './category.interface';
import {SubCategory} from './sub-category.interface';
import {Brand} from './brand.interface';
import {Unit} from './unit.interface';
import {Vendor} from './vendor.interface';

export interface Product {
  _id?: string;
  productId?: string;
  name?: string;
  category?: Category;
  vendor?: Vendor;
  subcategory?: SubCategory;
  brand?: Brand;
  unit?: Unit;
  sku?: string;
  others?: string;
  model?: string;
  quantity?: number;
  description?: string;
  purchasePrice?: number;
  salePrice?: number;
  status?: boolean;
  soldQuantity?: number;
  images?: [];
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}


export interface ProductCalculation {
  totalQuantity: number,
  totalPurchasePrice: number,
  totalSalePrice: number
  sumPurchasePrice:number,
  sumSalePrice: number,
}
