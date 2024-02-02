import { PreOderService } from './../../../services/common/pre-order.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UiService } from '../../../services/core/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReloadService } from '../../../services/core/reload.service';
import {
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  pluck,
  Subscription,
  switchMap,
} from 'rxjs';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { CustomerService } from '../../../services/common/customer.service';
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import { Pagination } from 'src/app/interfaces/core/pagination';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { UtilsService } from 'src/app/services/core/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/ui/confirm-dialog/confirm-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as XLSX from 'xlsx';
import { PreOrder } from 'src/app/interfaces/common/pre-oder.interface';

@Component({
  selector: 'app-pre-order-list',
  templateUrl: './pre-order-list.component.html',
  styleUrls: ['./pre-order-list.component.scss']
})

export class PreOrderListComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  id?: string;
  sales: PreOrder[] = [];
  holdPrevData: PreOrder[] = [];
  newSalesCount = 0;
  isLoading: boolean = true;

  // Pagination
  currentPage = 1;
  totalSales = 0;
  salesPerPage = 10;
  totalSalesStore = 0;
  showPerPageList = [
    { num: '10' },
    { num: '25' },
    { num: '50' },
    { num: '100' },
  ];

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  // Search Area
  @ViewChild('searchForm') searchForm: NgForm;
  searchQuery = null;
  searchProducts: PreOrder[] = [];

  // Date
  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeFilter3: number = null;
  activeSort: number;

  subForm: Subscription;
  subRouteOne: Subscription;

  constructor(
    private customerService: CustomerService,
    private preOrderService: PreOderService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
  ) {}

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  ngOnInit(): void {


    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllPreOrder();
    });

    // GET PAGE FROM QUERY PARAM
    this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam && qParam.get('page')) {
        this.currentPage = Number(qParam.get('page'));
      } else {
        this.currentPage = 1;
      }
      this.getAllPreOrder();
    });
  }

  ngAfterViewInit(): void {
    const formValue = this.searchForm.valueChanges;

    this.subForm = formValue
      .pipe(
        // map(t => t.searchTerm)
        // filter(() => this.searchForm.valid),
        pluck('searchTerm'),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((data) => {
          this.searchQuery = data;
          if (this.searchQuery === '' || this.searchQuery === null) {
            this.searchProducts = [];
            this.sales = this.holdPrevData;
            this.totalSales = this.totalSalesStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.salesPerPage),
            currentPage: Number(this.currentPage) - 1,
          };

          // Select
          const mSelect = {
            invoiceNo: 1,
            date: 1,
            customer: 1,
            salesman: 1,
            status: 1,
            soldDate: 1,
            total: 1,
            subTotal: 1,
            discountAmount: 1,
            createdAt: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.preOrderService.getAllNewPreOder(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.searchProducts = res.data;

          console.log('this is response,searchProducts', this.searchProducts);

          this.sales = this.searchProducts;
          this.totalSales = res.count;
          this.totalSalesStore = res.count;
          this.currentPage = 1;
          this.router.navigate([], { queryParams: { page: this.currentPage } });
        },
        error: (error) => {
          console.log(error);
        },
      });
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
   * getAllPreOrder()
   * deletePreOrderById()
   */

  private getAllPreOrder() {
    this.spinner.show();
    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: {
        invoiceNo: 1,
        date: 1,
        customer: 1,
        salesman: 1,
        status: 1,
        soldDate: 1,
        total: 1,
        subTotal: 1,
        discountAmount: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.preOrderService
      .getAllNewPreOder(filter, null)
      .subscribe({
        next: (res) => {
          // console.log(res)
          if (res.success) {
            this.sales = res.data;
            this.newSalesCount = res.count;
            this.holdPrevData = res.data;
            this.totalSalesStore = this.newSalesCount;
            // Spinner..
            this.isLoading = false;
            this.spinner.hide();
          }
        },
        error: (err) => {
          console.log(err);
          // Spinner..
          this.isLoading = false;
          this.spinner.hide();
        },
      });
  }

  private deleteMultipleProductById() {
    this.spinner.show();
    this.subDataTwo = this.preOrderService
      .deleteMultipleProductById(this.selectedIds)
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.success) {
            this.selectedIds = [];
            this.uiService.success(res.message);
            // fetch Data
            if (this.currentPage > 1) {
              this.router.navigate([], { queryParams: { page: 1 } });
            } else {
              this.getAllPreOrder();
            }
          } else {
            this.uiService.warn(res.message);
          }
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }

  private deletePreOrderById(id: any) {
    this.subDataTwo = this.preOrderService.deleteNewPreOderById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`Sales Deleted`);
          this.reloadService.needRefreshBrand$();
          this.router.navigate(['/sales/', 'sales-list']);
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  public onPageChanged(event: any) {
    this.router.navigate([], { queryParams: { page: event } });
  }

  onSelectShowPerPage(val) {
    this.salesPerPage = val;
    this.getAllPreOrder();
  }

  /**
   * ON Select Check
   * onCheckChange()
   * onAllSelectChange()
   * checkSelectionData()
   */

  onCheckChange(event: any, index: number, id: string) {
    if (event) {
      this.selectedIds.push(id);
    } else {
      const i = this.selectedIds.findIndex((f) => f === id);
      this.selectedIds.splice(i, 1);
    }
  }

  onAllSelectChange(event: MatCheckboxChange) {
    const currentPageIds = this.sales.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.sales.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.sales.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }
  private checkSelectionData() {
    let isAllSelect = true;
    this.sales.forEach((m) => {
      if (!m.select) {
        isAllSelect = false;
      }
    });

    this.matCheckbox.checked = isAllSelect;
  }

  /**
   * COMPONENT DIALOG VIEW
   */
  public openConfirmDialog(type: string, data?: any) {
    switch (type) {
      case 'delete': {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: 'Confirm Delete',
            message: 'Are you sure you want delete this data?',
          },
        });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.deleteMultipleProductById();
          }
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * FILTER DATA & Sorting
   * filterData()
   * endChangeRegDateRange()
   * sortData()
   * onPageChanged()
   * onSelectShowPerPage()
   */

  // filterData(value: any, index: number, type: string) {
  //   switch (type) {
  //     case 'brand': {
  //       this.filter = { ...this.filter, ...{ 'brand._id': value } };
  //       this.activeFilter2 = index;
  //       break;
  //     }
  //     default: {
  //       break;
  //     }
  //   }
  //   // Re fetch Data
  //   if (this.currentPage > 1) {
  //     this.router.navigate([], { queryParams: { page: 1 } });
  //   } else {
  //     this.getAllBrands();
  //   }
  // }

  endChangeRegDateRange(event: MatDatepickerInputEvent<any>) {
    if (event.value) {
      const startDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.start
      );
      const endDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.end
      );

      const qData = { soldDateString: { $gte: startDate, $lte: endDate } };
      this.filter = { ...this.filter, ...qData };
      // const index = this.filter.findIndex(x => x.hasOwnProperty('createdAt'));

      if (this.currentPage > 1) {
        this.router.navigate([], { queryParams: { page: 1 } });
      } else {
        this.getAllPreOrder();
      }
    }
  }

  /**
   * EXPORTS TO EXCEL
   * exportToExcel()
   */
  //
  // exportToAllExcel() {
  //   const date = this.utilsService.getDateString(new Date());
  //
  //   this.spinner.show();
  //
  //   // Select
  //   const mSelect = {
  //     invoiceNo: 1,
  //     customer: 1,
  //     salesman: 1,
  //     status: 1,
  //     soldDate: 1,
  //     total: 1,
  //     subTotal: 1,
  //     discountAmount: 1
  //   }
  //
  //   const filterData: FilterData = {
  //     filter: null,
  //     select: mSelect,
  //     sort: this.sortQuery
  //   }
  //
  //
  // //   this.subDataOne = this.preOrderService.getAllPreOrder(filterData, this.searchQuery)
  // //     .subscribe({
  // //       next: (res => {
  // //         const subscriptionReports = res.data;
  // //
  // //         const mData = subscriptionReports.map(m => {
  // //           return {
  // //             Id: m.invoiceNo,
  // //             Customer Phone: m.customer.phone,
  // //             Sku: m.sku,
  // //             Category: m?.category?.name,
  // //             Brand: m?.brand?.name,
  // //             Price: m?.salePrice,
  // //             Unit: m?.unit?.name,
  // //             Quantity: m?.quantity,
  // //             'Purchase Price': m?.purchasePrice,
  // //             // Satus: 1,
  // //             createdAt: this.utilsService.getDateString(m.createdAt),
  // //           }
  // //         })
  // //
  // //         // console.warn(mData)
  // //         // EXPORT XLSX
  // //         const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
  // //         const wb: XLSX.WorkBook = XLSX.utils.book_new();
  // //         XLSX.utils.book_append_sheet(wb, ws, 'Data');
  // //         XLSX.writeFile(wb, `Products_Reports_${date}.xlsx`);
  // //
  // //         this.spinner.hide();
  // //       }),
  // //       error: (error => {
  // //         this.spinner.hide();
  // //         console.log(error);
  // //       })
  // //     });
  // //

  //  }

  /**
   * EXPORTS TO EXCEL
   * exportToExcel()
   */

  // exportToAllExcel() {
  //   const date = this.utilsService.getDateString(new Date());
  //
  //   // Select
  //   const mSelect = {
  //     invoiceNo: 1,
  //     date: 1,
  //     customer: 1,
  //     salesman: 1,
  //     status: 1,
  //     soldDate: 1,
  //     subTotal: 1,
  //     total: 1,
  //     discountAmount: 1,
  //   };
  //
  //   const filterData: FilterData = {
  //     filter: null,
  //     select: mSelect,
  //     sort: this.sortQuery,
  //   };
  //
  //   this.subDataOne = this.preOrderService
  //     .getAllPreOrder(filterData, this.searchQuery)
  //     .subscribe({
  //       next: (res) => {
  //         const subscriptionReports = res.data;
  //
  //         const mData = subscriptionReports.map((m) => {
  //           return {
  //             Id: m.invoiceNo,
  //             CustomerPhone: m.customer.phone,
  //             Salesman: m.salesman,
  //             soldDate: m?.soldDate,
  //             subTotal: m?.subTotal,
  //             total: m?.total,
  //             discountAmount: m?.discountAmount,
  //             createdAt: this.utilsService.getDateString(m.createdAt),
  //           };
  //         });
  //
  //         // console.warn(mData)
  //         // EXPORT XLSX
  //         const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
  //         const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //         XLSX.utils.book_append_sheet(wb, ws, 'Data');
  //         XLSX.writeFile(wb, `Sales_Reports_${date}.xlsx`);
  //       },
  //       error: (error) => {
  //         console.log(error);
  //       },
  //     });
  // }

  /**
   * ON REMOVE ALL QUERY
   */

  onRemoveAllQuery() {
    this.activeSort = null;
    this.activeFilter1 = null;
    this.activeFilter2 = null;
    this.sortQuery = {createdAt: -1};
    this.filter = null;
    this.dataFormDateRange.reset();
    // Re fetch Data
    if (this.currentPage > 1) {
      this.router.navigate([], {queryParams: {page: 1}});
    } else {
      this.getAllPreOrder();
    }
  }

  /**
   * UI Essentials
   * onToggle()
   */

  onToggle() {
    console.log('Click');
    this.toggleMenu = !this.toggleMenu;
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
