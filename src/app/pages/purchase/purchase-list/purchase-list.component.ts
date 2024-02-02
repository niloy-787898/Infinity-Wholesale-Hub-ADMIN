import { Component, OnInit } from '@angular/core';
import {UiService} from "../../../services/core/ui.service";
import {Router} from "@angular/router";
import {ReloadService} from "../../../services/core/reload.service";
import {Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {PurchaseService} from "../../../services/common/purchase.service";
import {SupplierService} from "../../../services/common/supplier.service";
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import {ProductPurchase} from "../../../interfaces/common/product-purchase.interface";


@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  id?: string;
  purchases: ProductPurchase[] = [];
  purchasesCount = 0;

  constructor(
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService
  ) {}

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  ngOnInit(): void {
    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllPurchase();
    });
    this.getAllPurchase();
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
   *  getAllPurchase()
   *  deletePurchaseById()
   */

  private getAllPurchase() {
    const filter: FilterData = {
      filter: null,
      pagination: null,
      select: {
        supplier: 1,
        date: 1,
        product: 1,
        referenceNo: 1,
        status: 1,
        createdAt: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.purchaseService
      .getAllPurchase(filter, null)
      .subscribe({
        next: (res) => {
          // console.log(res)
          if (res.success) {
            this.purchases = res.data;
            this.purchasesCount = res.count;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  private deletePurchaseById(id: any) {
    this.subDataTwo = this.purchaseService.deletePurchaseById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`Purchase Deleted`);
          this.reloadService.needRefreshBrand$();
          this.router.navigate(['/purchase/', 'purchase-list']);
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
