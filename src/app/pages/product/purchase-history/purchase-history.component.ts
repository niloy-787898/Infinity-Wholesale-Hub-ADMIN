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
import { NewSalesService } from '../../../services/common/new-sales.service';
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import { Pagination } from 'src/app/interfaces/core/pagination';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { UtilsService } from 'src/app/services/core/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/ui/confirm-dialog/confirm-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Admin } from 'src/app/interfaces/admin/admin';
import { AdminDataService } from 'src/app/services/admin/admin-data.service';
import { Select } from 'src/app/interfaces/core/select';
import { MONTHS } from 'src/app/core/utils/app-data';
import {PurchaseService} from "../../../services/common/purchase.service";
import {ProductPurchase, ProductPurchaseGroup} from "../../../interfaces/common/product-purchase.interface";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-sales-list-month',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss'],
})
export class PurchaseHistoryComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  id?: string;
  productPurchases: ProductPurchaseGroup[] = [];
  newSalesCount = 0;
  salesmans: Admin[] = [];
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
  searchProducts: ProductPurchase[] = [];

  // Date
  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // Static Data
  months: Select[] = MONTHS

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeFilter3: number = null;
  activeFilter4: number = null;
  activeFilter5: number = null;
  activeSort: number;

  subForm: Subscription;
  subRouteOne: Subscription;
  subDataSeven: any;

  constructor(
    private customerService: CustomerService,
    private newSalesService: NewSalesService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,

    private purchaseService: PurchaseService,
    private salesmanDataService: AdminDataService,
  ) {
    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;

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

      const startDate = this.utilsService.getDateString(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      );
      const endDate = this.utilsService.getDateString(
        new Date()
      );

      const qData = { createdAtString: { $gte: startDate, $lte: endDate } };
      this.filter = { ...this.filter, ...qData };
      this.setDefaultFilter();
      this.getAllNewSales();
      this.getAllSalesman();
    });
  }

  // ngAfterViewInit(): void {
  //   const formValue = this.searchForm.valueChanges;
  //
  //   this.subForm = formValue
  //     .pipe(
  //       // map(t => t.searchTerm)
  //       // filter(() => this.searchForm.valid),
  //       pluck('searchTerm'),
  //       debounceTime(200),
  //       distinctUntilChanged(),
  //       switchMap((data) => {
  //         this.searchQuery = data;
  //         if (this.searchQuery === '' || this.searchQuery === null) {
  //           this.searchProducts = [];
  //           this.sales = this.holdPrevData;
  //           this.totalSales = this.totalSalesStore;
  //           // this.salesCalculation = this.holdTotalSalesCalculation;
  //           this.searchQuery = null;
  //           return EMPTY;
  //         }
  //         const pagination: Pagination = {
  //           pageSize: Number(this.salesPerPage),
  //           currentPage: Number(this.currentPage) - 1,
  //         };
  //
  //         // Select
  //         const mSelect = {
  //           invoiceNo: 1,
  //           date: 1,
  //           customer: 1,
  //           salesman: 1,
  //           status: 1,
  //           soldDate: 1,
  //           total: 1,
  //           subTotal: 1,
  //           discountAmount: 1,
  //           createdAt: 1,
  //         };
  //
  //         const filterData: FilterData = {
  //           pagination: pagination,
  //           filter: { 'month': new Date().getMonth() },
  //           select: mSelect,
  //           sort: { createdAt: -1 },
  //         };
  //
  //         return this.newSalesService.getAllNewSales(
  //           filterData,
  //           this.searchQuery
  //         );
  //       })
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.searchProducts = res.data;
  //
  //         console.log('this is response,searchProducts', this.searchProducts);
  //
  //         this.sales = this.searchProducts;
  //         this.totalSales = res.count;
  //         this.totalSalesStore = res.count;
  //         this.salesCalculation = res.calculation;
  //         this.holdTotalSalesCalculation = this.salesCalculation;
  //         this.currentPage = 1;
  //         this.router.navigate([], { queryParams: { page: this.currentPage } });
  //       },
  //       error: (error) => {
  //         console.log(error);
  //       },
  //     });
  // }

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
      filter: {...this.filter},
      pagination: null,
      select: {
        product: 1,
        previousQuantity: 1,
        updatedQuantity: 1,
        createdAtString: 1,
        updatedAtString: 1,
        month: 1,
        year: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.purchaseService
      .getAllPurchase({ ...filter }, null)
      // .getAllNewSales()
      .subscribe({
        next: (res) => {
          // console.log(res)
          if (res.success) {
            console.log(res.data)
            this.productPurchases = this.purchaseService.newPurchaseGroupByField(res.data,'createdAtString')
            console.log(this.productPurchases)

            this.newSalesCount = res.count;
            // this.holdPrevData = this.sales;
            // this.salesCalculation = res.calculation;
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
    this.subDataTwo = this.purchaseService
      .deleteMultiplePurchaseById(this.selectedIds)
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

  private deleteNewSalesById(id: any) {
    this.subDataTwo = this.newSalesService.deleteNewSalesById(id).subscribe({
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
  private getAllSalesman() {
    // Select
    const mSelect = {
      name: 1,
      phoneNo: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: { name: 1 },
    };

    this.subDataSeven = this.salesmanDataService.getAllAdmins(filterData, null).subscribe({
      next: (res) => {
        this.salesmans = res.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public onPageChanged(event: any) {
    this.router.navigate([], { queryParams: { page: event } });
  }

  onSelectShowPerPage(val) {
    this.salesPerPage = val;
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
    // const currentPageIds = this.sales.map((m) => m._id);
    // if (event.checked) {
    //   this.selectedIds = this.utilsService.mergeArrayString(
    //     this.selectedIds,
    //     currentPageIds
    //   );
    //   this.sales.forEach((m) => {
    //     m.select = true;
    //   });
    // } else {
    //   currentPageIds.forEach((m) => {
    //     this.sales.find((f) => f._id === m).select = false;
    //     const i = this.selectedIds.findIndex((f) => f === m);
    //     this.selectedIds.splice(i, 1);
    //   });
    // }
  }
  private checkSelectionData() {
      // let isAllSelect = true;
      // this.sales.forEach((m) => {
      //   if (!m.select) {
      //     isAllSelect = false;
      //   }
      // });
      //
      // this.matCheckbox.checked = isAllSelect;
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
   * setDefaultFilter()
   */

  private setDefaultFilter() {
    // this.isDefaultFilter = true;
    const month = this.utilsService.getDateMonth(false, new Date());
    const year = new Date().getFullYear();

    // this.filter = {...this.filter,...{
    //   month: month,
    //     year: year,
    // }}
    this.activeFilter5 = this.months.findIndex(f => f.value === month);
    // this.activeFilter2 = this.years.findIndex(f => f.value === year);
  }

  filterData(value: any, index: number, type: string) {
    switch (type) {
      case 'salesman': {
        this.filter = { ...this.filter, ...{ 'salesman._id': value } };
        this.activeFilter2 = index;
        break;
      }
      case 'month': {
        this.dataFormDateRange.reset();
        if(this.filter.createdAtString){
          delete this.filter.createdAtString;
        }
        this.filter = { ...this.filter, ...{ 'month': value-1,'year': new Date().getFullYear() } };
        this.activeFilter5 = index;
        break;
      }
      default: {
        break;
      }
    }
    // Re fetch Data
    if (this.currentPage > 1) {
      this.router.navigate([], { queryParams: { page: 1 } });
    } else {
      this.getAllNewSales();
    }
  }

  endChangeRegDateRange(event: MatDatepickerInputEvent<any>) {
    if(this.filter.month){
      delete this.filter.month;
    }
    if(this.filter.year){
      delete this.filter.year;
    }
    this.activeFilter5 = null;
    if (event.value) {
      const startDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.start
      );
      const endDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.end
      );

      const qData = { createdAtString: { $gte: startDate, $lte: endDate } };
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
  // //   this.subDataOne = this.newSalesService.getAllNewSales(filterData, this.searchQuery)
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
  //   this.subDataOne = this.newSalesService
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
    this.sortQuery = { createdAt: -1 };
    this.filter = null;
    this.dataFormDateRange.reset();
    // Re fetch Data
    if (this.currentPage > 1) {
      this.router.navigate([], { queryParams: { page: 1 } });
    } else {
      this.getAllNewSales();
    }
  }



  // calculation funciton


  getSum(items): number {
    console.log("items",items)
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += ((items[i].updatedQuantity - items[i].previousQuantity) * items[i].product.purchasePrice);
    }
    return sum;
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
