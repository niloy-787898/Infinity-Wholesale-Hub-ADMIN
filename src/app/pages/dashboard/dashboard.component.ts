import {Component, OnDestroy, OnInit} from '@angular/core';
import {SaleDashboard} from '../../interfaces/common/dashboard.interface';
import {DashboardService} from '../../services/common/dashboard.service';
import {Subscription} from 'rxjs';
import { AdminService } from 'src/app/services/admin/admin.service';
import { NewSalesService } from 'src/app/services/common/new-sales.service';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { NewSales, NewSalesGroup } from 'src/app/interfaces/common/new-sales.interface';
import {UtilsService} from '../../services/core/utils.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  USER_ROLE : any;
  saleDashboard: SaleDashboard = null;
  saleDashboard2: any;
  // Subscriptions
  private subDataOne: Subscription;

  // FilterData
  filter: any = null;
  sortQuery: any = null;

  //storing data
  sales: NewSales[] = [];
  salesGroup: NewSalesGroup[] = [];

  constructor(
    private dashboardService: DashboardService,
    private adminService: AdminService,
    private utilsService: UtilsService,
  ) {
  }

  ngOnInit(): void {
    this.USER_ROLE = this.adminService.getAdminRole();
    this.getSalesDashboard();
    // this.getAllSales();
  }


  /**
   * HTTP REQ HANDLE
   * getUserDashboard()
   */
  getSalesDashboard() {
    this.subDataOne = this.dashboardService.getSalesDashboard()
      .subscribe({
        next: (res) => {
          this.saleDashboard = res.data;
        },
        error: (err) => {
          console.log(err)
        }
      })
  }

  /**
   * NG ON DESTROY
   */
  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }
  }
}
