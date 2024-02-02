import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import {Product, ProductCalculation} from '../../interfaces/common/product.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { Observable } from "rxjs";

const API_PRODUCT = environment.apiBaseLink + '/api/product/';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addProduct
   * insertManyProduct
   * getAllProducts
   * getProductById
   * updateProductById
   * updateMultipleProductById
   * deleteProductById
   * deleteMultipleProductById
   */

  // getAllCategories(filterData: FilterData, searchQuery?: string) {
  //   let params = new HttpParams();
  //   if (searchQuery) {
  //     params = params.append('q', searchQuery);
  //   }
  //   return this.httpClient.post<{ data: Product[], count: number, success: boolean }>(API_SUB_CATEGORY + 'get-all', filterData, {params});
  // }

  addProduct(data: Product): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_PRODUCT + 'add', data);
  }

  getAllProducts(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Product[], count: number, success: boolean, calculation: ProductCalculation }>(API_PRODUCT + 'get-all/', filterData, { params });
  }

  getProductById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Product, message: string, success: boolean }>(API_PRODUCT + id, { params });
  }

  updateProductById(id: string, data: Product) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_PRODUCT + 'update/' + id, data);
  }


  deleteMultipleProductById(ids: string[], checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.post<ResponsePayload>(API_PRODUCT + 'delete-multiple', { ids: ids }, { params });
  }




  // deleteProductById(id: string) {
  //   return this.httpClient.delete<ResponsePayload>(API_PRODUCT + 'delete/' + id);
  // }

  deleteProductById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_PRODUCT + 'delete/' + id, { params });
  }

  insertManyProducts(data: Product[], option?: any) {
    const mData = { data, option }
    return this.httpClient.post<ResponsePayload>
      (API_PRODUCT + 'insert-many', mData);
  }

  // productGroupByField<T>(dataArray: T[], field: string): ProductGroup[] {
  //   const data = dataArray.reduce((group, product) => {
  //     const uniqueField = product[field]
  //     group[uniqueField] = group[uniqueField] ?? [];
  //     group[uniqueField].push(product);
  //     return group;
  //   }, {});
  //
  //   const final = [];
  //
  //   for (const key in data) {
  //     final.push({
  //       _id: key,
  //       data: data[key]
  //     })
  //   }
  //
  //   return final as ProductGroup[];

  // }



}
