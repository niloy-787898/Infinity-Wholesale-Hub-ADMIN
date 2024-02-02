import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from "../../../services/common/customer.service";
import { UiService } from "../../../services/core/ui.service";
import { Router } from "@angular/router";
import { ReloadService } from "../../../services/core/reload.service";
import { Subscription } from "rxjs";
import { FilterData } from "../../../interfaces/gallery/filter-data";
import { NewSalesReturn } from "../../../interfaces/common/new-sales-return.interface";
import { NewSalesReturnService } from "../../../services/common/new-sales-return.service";
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-sales-return-list',
  templateUrl: './sales-return-list.component.html',
  styleUrls: ['./sales-return-list.component.scss'],
})
export class SalesReturnListComponent implements OnInit {

  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  id?: string;
  newSalesReturns: NewSalesReturn[] = [];
  newSalesReturnsCount = 0;

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  constructor(
    private customerService: CustomerService,
    private newSalesReturnService: NewSalesReturnService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService
  ) { }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  ngOnInit(): void {
    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllNewSalesReturn();
    });
    this.getAllNewSalesReturn();
  }

  /**
   * CHECK ADMIN PERMISSION
   * checkAddPermission()
   * checkDeletePermission()
   * checkEditPermission()
   * getAdminBaseData()
   */
  checkAddPermission(): boolean {
    return this.permissions.includes(AdminPermissions.CREATE);
  }

  checkDeletePermission(): boolean {
    return this.permissions.includes(AdminPermissions.DELETE);
  }

  checkEditPermission(): boolean {
    return this.permissions.includes(AdminPermissions.EDIT);
  }

  /**
   * HTTP REQ HANDLE
   * getAllNewSalesReturn()
   * deleteNewSalesReturnById()
   */

  private getAllNewSalesReturn() {
    const filter: FilterData = {
      filter: null,
      pagination: null,
      select: {
        invoiceNo: 1,
        date: 1,
        customer: 1,
        salesman: 1,
        status: 1,
        returnDate: 1,
        total: 1,
        subTotal: 1,
        discountAmount: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.newSalesReturnService
      .getAllNewSalesReturn(filter, null)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.newSalesReturns = res.data;
            this.newSalesReturnsCount = res.count;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  private deleteNewSalesReturnById(id: any) {
    this.subDataTwo = this.newSalesReturnService
      .deleteNewSalesReturnById(id)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.uiService.warn(`Sales Deleted`);
            this.reloadService.needRefreshBrand$();
            this.router.navigate(['/sales/', 'sales-return-list']);
          } else {
            this.uiService.warn(res.message);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  /**
   * ON DESTROY
   */

  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }

    if (this.subDataTwo) {
      this.subDataTwo.unsubscribe();
    }
  }
}
