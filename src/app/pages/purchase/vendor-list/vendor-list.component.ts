import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminPermissions } from '../../../enum/admin-permission.enum';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { EMPTY, Subscription } from 'rxjs';
import { UiService } from '../../../services/core/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReloadService } from '../../../services/core/reload.service';
import { UtilsService } from '../../../services/core/utils.service';
import {
  debounceTime,
  distinctUntilChanged,
  pluck,
  switchMap,
} from 'rxjs/operators';
import { Pagination } from '../../../interfaces/core/pagination';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Vendor } from '../../../interfaces/common/vendor.interface';
import { VendorService } from '../../../services/common/vendor.service';
import * as XLSX from 'xlsx';
import { ConfirmDialogComponent } from "../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss'],
})
export class VendorListComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  holdPrevData: Vendor[] = [];
  vendors: Vendor[] = [];
  vendorCount = 0;
  id?: string;
  isLoading: boolean = true;

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // Search Area
  @ViewChild('searchForm') searchForm: NgForm;
  searchQuery = null;
  searchCustomer: Vendor[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subRouteOne: Subscription;
  private subForm: Subscription;

  constructor(
    private vendorService: VendorService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute
  ) { }

  // Pagination
  currentPage = 1;
  totalVendor = 0;
  VendorPerPage = 5;
  totalVendorStore = 0;

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeSort: number;
  number = [{ num: '10' }, { num: '25' }, { num: '50' }, { num: '100' }];

  ngOnInit(): void {
    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllVendors();
    });

    // GET PAGE FROM QUERY PARAM
    this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam && qParam.get('page')) {
        this.currentPage = Number(qParam.get('page'));
      } else {
        this.currentPage = 1;
      }
      this.getAllVendors();
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
            this.searchCustomer = [];
            this.vendors = this.holdPrevData;
            this.totalVendor = this.totalVendorStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.VendorPerPage),
            currentPage: Number(this.currentPage) - 1,
          };
          // Select
          const mSelect = {
            name: 1,
            phone: 1,
            email: 1,
            image: 1,
            createdAt: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.vendorService.getAllVendors(filterData, this.searchQuery);
        })
      )
      .subscribe({
        next: (res) => {
          this.searchCustomer = res.data;
          this.vendors = this.searchCustomer;
          this.totalVendor = res.count;
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

  public onPageChanged(event: any) {
    this.router.navigate([], { queryParams: { page: event } });
  }

  /**
   * HTTP REQ HANDLE
   * getAllVendors()
   * deleteVendorById()
   */

  private getAllVendors() {
    // Spinner..
    this.spinner.show();
    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: {
        name: 1,
        phone: 1,
        email: 1,
        image: 1,
        createdAt: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.vendorService.getAllVendors(filter, null).subscribe({
      next: (res) => {
        // console.log(res)
        if (res.success) {
          this.vendors = res.data;
          this.vendorCount = res.count;
          this.holdPrevData = this.vendors;
          this.totalVendorStore = this.vendorCount;
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

  deleteVendorById(id: any) {
    this.subDataTwo = this.vendorService.deleteVendorById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`Vendor Deleted`);
          this.reloadService.needRefreshVendor$();
          this.router.navigate(['/purchase/', 'vendor-list']);
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private deleteMultipleVendorById() {
    this.spinner.show();
    this.subDataTwo = this.vendorService
      .deleteMultipleVendorById(this.selectedIds)
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
              this.getAllVendors();
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
   *onSelectShowPerPage()
   */

  filterData(value: any, index: number, type: string) {
    switch (type) {
      case 'vendor': {
        this.filter = { ...this.filter, ...{ vendor: value } };
        this.activeFilter2 = index;
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
      this.getAllVendors();
    }
  }

  onCheckChange(event: any, index: number, id: string) {
    if (event) {
      this.selectedIds.push(id);
    } else {
      const i = this.selectedIds.findIndex((f) => f === id);
      this.selectedIds.splice(i, 1);
    }
  }

  onAllSelectChange(event: MatCheckboxChange) {
    const currentPageIds = this.vendors.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );

      this.vendors.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.vendors.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }

  onSelectShowPerPage(val) {
    this.VendorPerPage = val;
    this.getAllVendors();
  }

  private checkSelectionData() {
    let isAllSelect = true;
    this.vendors.forEach((m) => {
      if (!m.select) {
        isAllSelect = false;
      }
    });

    this.matCheckbox.checked = isAllSelect;
  }

  endChangeRegDateRange(event: MatDatepickerInputEvent<any>) {
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
        this.getAllVendors();
      }
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllVendors();
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
      name: 1,
      phone: 1,
      email: 1,
      createdAt: 1,
    };

    const filterData: FilterData = {
      filter: null,
      select: mSelect,
      sort: this.sortQuery,
    };

    this.subDataOne = this.vendorService
      .getAllVendors(filterData, this.searchQuery)
      .subscribe({
        next: (res) => {
          const subscriptionReports = res.data;

          const mData = subscriptionReports.map((m) => {
            return {
              Name: m.name,
              Phone: m.phone,
              Email: m.email,
              createdAt: this.utilsService.getDateString(m.createdAt),
            };
          });

          // console.warn(mData)
          // EXPORT XLSX
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, `Vendor_Reports_${date}.xlsx`);
        },
        error: (error) => {
          console.log(error);
        },
      });
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
      this.getAllVendors();
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
            this.deleteMultipleVendorById();
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
