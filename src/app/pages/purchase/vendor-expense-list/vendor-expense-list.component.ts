import {Component, OnInit, ViewChild} from '@angular/core';
import {UiService} from "../../../services/core/ui.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ReloadService} from "../../../services/core/reload.service";
import {EMPTY, Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {UtilsService} from "../../../services/core/utils.service";
import {debounceTime, distinctUntilChanged, pluck, switchMap} from "rxjs/operators";
import {Pagination} from "../../../interfaces/core/pagination";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import * as XLSX from 'xlsx';
import {MatDialog} from "@angular/material/dialog";
import {NgxSpinnerService} from "ngx-spinner";
import {ConfirmDialogComponent} from "../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import {TransactionsService} from "../../../services/common/transactions.service";
import {Transactions} from "../../../interfaces/common/transaction.interface";

@Component({
  selector: 'app-vendor-expense-list',
  templateUrl: './vendor-expense-list.component.html',
  styleUrls: ['./vendor-expense-list.component.scss'],
})
export class VendorExpenseListComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  transactions: Transactions[] = [];
  holdPrevData: Transactions[] = [];
  transactionsCount = 0;
  id?: string;
  isLoading: boolean = true;
  calculation: object={};

  // Pagination
  currentPage = 1;
  totalTransactions = 0;
  TransactionsPerPage = 5;
  totalTransactionsStore = 0;

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeSort: number;
  number = [{ num: '10' }, { num: '25' }, { num: '50' }, { num: '100' }];

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  // Date
  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // Search Area
  @ViewChild('searchForm') searchForm: NgForm;
  searchQuery = null;
  searchTransactions: Transactions[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subForm: Subscription;
  private subRouteOne: Subscription;

  constructor(
    private transactionService: TransactionsService,
    private uiService: UiService,
    private utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private reloadService: ReloadService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.reloadService.refreshBrand$.subscribe(() => {
    //   this.getAllExpense();
    // });

    // // GET PAGE FROM QUERY PARAM
    // this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
    //   if (qParam && qParam.get('page')) {
    //     this.currentPage = Number(qParam.get('page'));
    //   } else {
    //     this.currentPage = 1;
    //   }
    //   this.getAllExpense();
    // });

    // GET ID FORM PARAM

    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.filterData(this.id,1,'vendor')
        // this.getAllExpense();
      }
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
            this.searchTransactions = [];
            this.transactions = this.holdPrevData;
            this.totalTransactions = this.totalTransactionsStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.TransactionsPerPage),
            currentPage: Number(this.currentPage) - 1,
          };

          // Select
          const mSelect = {
            transactionDate: 1,
            transactionDateString: 1,
            dueAmount: 1,
            vendor: 1,
            paidAmount: 1,
            description: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            select: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.transactionService.getAllTransactions(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.searchTransactions = res.data;
          this.transactions = this.searchTransactions;
          this.totalTransactions = res.count;
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
   * onSelectShowPerPage()
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

  onSelectShowPerPage(val) {
    this.TransactionsPerPage = val;
    this.getAllExpense();
  }

  /**
   * HTTP REQ HANDLE
   * getAllBrands()
   * deleteBrandById()
   */

  private getAllExpense() {
    // Spinner..
    this.spinner.show();
    // Select
    const mSelect = {
      transactionDate: 1,
      transactionDateString: 1,
      dueAmount: 1,
      vendor: 1,
      paidAmount: 1,
      description: 1,
      images: 1,
      createdAt: 1,
      updatedAt: 1,
      select: 1,
    };

    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: mSelect,
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.transactionService
      .getAllTransactions(filter, null)
      .subscribe({
        next: (res) => {
          if (res.success) {
            console.log(res.data)
            this.transactions = res.data;
            this.transactionsCount = res.count;
            this.holdPrevData = this.transactions;
            this.totalTransactions = this.transactionsCount;
            this.calculation = res.calculation;
            // Spinner..
            this.isLoading = false;
            this.spinner.hide();
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  deleteTransactionsById(id: any) {
    this.subDataTwo = this.transactionService.deleteTransactionsById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`Brand Deleted`);
          this.reloadService.needRefreshBrand$();
          this.router.navigate(['/product/', 'brand-list']);
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private deleteMultipleTransactionsById() {
    this.spinner.show();
    this.subDataTwo = this.transactionService
      .deleteMultipleTransactionsById(this.selectedIds)
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
              this.getAllExpense();
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

  /**
   * FILTER DATA & Sorting
   * filterData()
   * endChangeRegDateRange()
   * sortData()
   * onPageChanged()
   * onSelectShowPerPage()
   */

  filterData(value: any, index: number, type: string) {
    switch (type) {
      case 'expense': {
        this.filter = { ...this.filter, ...{ 'expense._id': value } };
        this.activeFilter2 = index;
        break;
      } case 'vendor': {
        this.filter = { ...this.filter, ...{ 'vendor._id': value } };
        // this.activeFilter2 = index;
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
      this.getAllExpense();
    }
  }

  endChangeRegDateRange(event: MatDatepickerInputEvent<any>) {
    if (event.value) {
      const startDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.start
      );
      const endDate = this.utilsService.getDateString(
        this.dataFormDateRange.value.end
      );

      const qData = { dateString: { $gte: startDate, $lte: endDate } };
      this.filter = { ...this.filter, ...qData };
      // const index = this.filter.findIndex(x => x.hasOwnProperty('createdAt'));

      if (this.currentPage > 1) {
        this.router.navigate([], { queryParams: { page: 1 } });
      } else {
        this.getAllExpense();
      }
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllExpense();
  }

  public onPageChanged(event: any) {
    this.router.navigate([], { queryParams: { page: event } });
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
    const currentPageIds = this.transactions.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.transactions.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.transactions.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }
  private checkSelectionData() {
    let isAllSelect = true;
    this.transactions.forEach((m) => {
      if (!m.select) {
        isAllSelect = false;
      }
    });

    this.matCheckbox.checked = isAllSelect;
  }

  /**
   * EXPORTS TO EXCEL
   * exportToExcel()
   */

  exportToAllExcel() {
    console.log('dfd');
    const date = this.utilsService.getDateString(new Date());

    // Select
    const mSelect = {
      date: 1,
      expenseFor: 1,
      paidAmount: 1,
      dueAmount: 1,

      createdAt: 1,
    };

    const filterData: FilterData = {
      filter: null,
      select: mSelect,
      sort: this.sortQuery,
    };

    this.subDataOne = this.transactionService
      .getAllTransactions(filterData, this.searchQuery)
      .subscribe({
        next: (res) => {
          const subscriptionReports = res.data;

          const mData = subscriptionReports.map((m) => {
            return {
              // 'Transaction': m.date,
              // 'Vendor': m.expenseFor,
              'Paid Amount': m.paidAmount,
              'Due Amount': m.dueAmount,
              createdAt: this.utilsService.getDateString(m.createdAt),
            };
          });

          // console.warn(mData)
          // EXPORT XLSX
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, `Expense_Reports_${date}.xlsx`);
        },
        error: (error) => {
          console.log(error);
        },
      });
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
            this.deleteMultipleTransactionsById();
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
      this.getAllExpense();
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

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }

    if (this.subForm) {
      this.subForm.unsubscribe();
    }
  }
}
