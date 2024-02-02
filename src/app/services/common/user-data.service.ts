import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {User} from '../../interfaces/common/user.interface';

const API_USER = environment.apiBaseLink + '/api/user/';


@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addUser
   * insertManyUser
   * getAllUsers
   * getUserById
   * updateUserById
   * updateMultipleUserById
   * deleteUserById
   * deleteMultipleUserById
   */

  getLoggedInUserData(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }

    return this.httpClient.get<{ data: User }>(API_USER + 'logged-in-user-data', {params});
  }

  updateLoggedInUserInfo(data: User) {
    return this.httpClient.put<ResponsePayload>(API_USER + 'update-logged-in-user', data);
  }

  changeLoggedInUserPassword(data: { password: string, oldPassword: string }) {
    return this.httpClient.put<ResponsePayload>(API_USER + 'change-logged-in-user-password', data);
  }


}
