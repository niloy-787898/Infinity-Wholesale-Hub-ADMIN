import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {SaleDashboard} from '../../interfaces/common/dashboard.interface';
import { NewSalesGroup } from 'src/app/interfaces/common/new-sales.interface';

const API_DASHBOARD = environment.apiBaseLink + '/api/dashboard/';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  getSalesDashboard(userId?: string) {
    return this.httpClient.get<{ data: SaleDashboard, message: string, success: boolean }>(API_DASHBOARD + 'sale-dashboard');
  }

  salesGroupByField<T>(dataArray: T[], field: string): NewSalesGroup[] {
    const data = dataArray.reduce((group, product) => {
      const uniqueField = product[field]
      group[uniqueField] = group[uniqueField] ?? [];
      group[uniqueField].push(product);
      return group;
    }, {});

    const final = [];

    for (const key in data) {
      final.push({
        _id: key,
        data: data[key]
      })
    }

    return final as NewSalesGroup[];

  }

}
