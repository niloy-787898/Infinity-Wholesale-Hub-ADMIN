import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {Users} from '../../interfaces/common/users.interface';
import {FilterData} from '../../interfaces/gallery/filter-data';
import {Observable} from "rxjs";

const API_USERS = environment.apiBaseLink + '/api/users/';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addUsers
   * insertManyUsers
   * getAllUserss
   * getUsersById
   * updateUsersById
   * updateMultipleUsersById
   * deleteUsersById
   * deleteMultipleUsersById
   */

  // getAllCategories(filterData: FilterData, searchQuery?: string) {
  //   let params = new HttpParams();
  //   if (searchQuery) {
  //     params = params.append('q', searchQuery);
  //   }
  //   return this.httpClient.post<{ data: Users[], count: number, success: boolean }>(API_SUB_CATEGORY + 'get-all', filterData, {params});
  // }

  addUsers(data: Users):Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_USERS + 'add', data);
  }

  getAllUsers(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Users[], count: number, success: boolean }>(API_USERS + 'get-all/', filterData, {params});
  }

  getUsersById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Users, message: string, success: boolean }>(API_USERS + id, {params});
  }

  updateUsersById(id: string, data: Users) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_USERS + 'update/' + id, data);
  }


  // deleteUsersById(id: string) {
  //   return this.httpClient.delete<ResponsePayload>(API_USERS + 'delete/' + id);
  // }

  deleteUsersById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_USERS + 'delete/' + id, {params});
  }

  // usersGroupByField<T>(dataArray: T[], field: string): UsersGroup[] {
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
  //   return final as UsersGroup[];

  // }



}
