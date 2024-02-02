import { Component,  OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm} from '@angular/forms';
import { UiService } from '../../../services/core/ui.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import {debounceTime, distinctUntilChanged, EMPTY, pluck, Subscription, switchMap} from 'rxjs';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { CustomerService } from '../../../services/common/customer.service';
import {AdminPermissions} from "../../../enum/admin-permission.enum";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {ReloadService} from "../../../services/core/reload.service";
import {UtilsService} from "../../../services/core/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {Pagination} from "../../../interfaces/core/pagination";
import {ConfirmDialogComponent} from "../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {NewSalesReturn} from "../../../interfaces/common/new-sales-return.interface";
import {NewSalesReturnService} from "../../../services/common/new-sales-return.service";


@Component({
  selector: 'app-return-sales',
  templateUrl: './return-sales.component.html',
  styleUrls: ['./return-sales.component.scss']
})
export class ReturnSalesComponent implements OnInit {


  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  id?: string;
  newSalesReturns: NewSalesReturn[] = [];
  holdPrevData: NewSalesReturn[] = [];
  SalesReturnCount = 0;
  isLoading: boolean = true;

  // Pagination
  currentPage = 1;
  totalReturnSales = 0;
  SalesReturnPerPage = 10;
  totalSalesReturnStore = 0;
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
  searchProducts: NewSalesReturn[] = [];

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
    private newSalesReturnService: NewSalesReturnService,
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
      this.getAllNewSales();
    });

    // GET PAGE FROM QUERY PARAM
    this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam && qParam.get('page')) {
        this.currentPage = Number(qParam.get('page'));
      } else {
        this.currentPage = 1;
      }
      this.getAllNewSales();
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
            this.newSalesReturns = this.holdPrevData;
            this.totalReturnSales = this.totalSalesReturnStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.SalesReturnPerPage),
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
            quantity:1,
            createdAt: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.newSalesReturnService.getAllNewSalesReturn(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.searchProducts = res.data;

          console.log('this is response,searchProducts', this.searchProducts);

          this.newSalesReturns = this.searchProducts;
          this.totalReturnSales = res.count;
          this.totalSalesReturnStore = res.count;
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
   * getAllNewSales()
   * deleteNewSalesById()
   */

  private getAllNewSales() {
    // Spinner..
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

    this.subDataOne = this.newSalesReturnService
      .getAllNewSalesReturn(filter, null)
      .subscribe({
        next: (res) => {
          // console.log(res)
          if (res.success) {
            this.newSalesReturns = res.data;
            this.SalesReturnCount = res.count;
            this.holdPrevData = res.data;
            this.totalSalesReturnStore= this.SalesReturnCount;
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
    this.subDataTwo = this.newSalesReturnService
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
              this.getAllNewSales();
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

  private deleteNewSalesReturnById(id: any) {
    this.subDataTwo = this.newSalesReturnService.deleteNewSalesReturnById(id).subscribe({
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
    this.SalesReturnPerPage = val;
    this.getAllNewSales();
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
    const currentPageIds = this.newSalesReturns.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.newSalesReturns.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.newSalesReturns.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }
  private checkSelectionData() {
    let isAllSelect = true;
    this.newSalesReturns.forEach((m) => {
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
        this.getAllNewSales();
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
  // //   this.subDataOne = this.newSalesReturnService.getAllNewSales(filterData, this.searchQuery)
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
  //   this.subDataOne = this.newSalesReturnService
  //     .getAllNewSales(filterData, this.searchQuery)
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
      this.getAllNewSales();
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
