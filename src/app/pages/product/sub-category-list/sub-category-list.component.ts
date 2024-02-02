import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UiService } from '../../../services/core/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReloadService } from '../../../services/core/reload.service';
import { EMPTY, Subscription } from 'rxjs';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { SubCategory } from '../../../interfaces/common/sub-category.interface';
import { SubCategoryService } from '../../../services/common/sub-category.service';
import { CategoryService } from '../../../services/common/category.service';
import { Category } from '../../../interfaces/common/category.interface';
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { UtilsService } from '../../../services/core/utils.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  debounceTime,
  distinctUntilChanged,
  pluck,
  switchMap,
} from 'rxjs/operators';
import * as XLSX from "xlsx";
import { Pagination } from '../../../interfaces/core/pagination';
import {ConfirmDialogComponent} from "../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-sub-category-list',
  templateUrl: './sub-category-list.component.html',
  styleUrls: ['./sub-category-list.component.scss'],
})
export class SubCategoryListComponent implements OnInit, OnDestroy {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  holdPrevData: SubCategory[] = [];
  categories: Category[] = [];
  subcategory?: SubCategory[] = [];
  subcategoryCount = 0;
  id?: string;

  // Selected Data
  selectedIds: string[] = [];
  @ViewChild('matCheckbox') matCheckbox: MatCheckbox;

  // Data
  today = new Date();
  dataFormDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  // Search Area
  @ViewChild('searchForm') searchForm: NgForm;
  searchQuery = null;
  searchSubCategory: SubCategory[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subRouteOne: Subscription;
  private subForm: Subscription;

  constructor(
    private subcategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private uiService: UiService,
    private utilsService: UtilsService,
    private router: Router,
    private reloadService: ReloadService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute
  ) { }

  // Pagination
  currentPage = 1;
  totalSubCategory = 0;
  SubCategoryPerPage = 5;
  totalSubCategoryStore = 0;

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeSort: number;
  number = [{ num: '10' }, { num: '25' }, { num: '50' }, { num: '100' }];

  ngOnInit(): void {
    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllSubCategory();
    });

    // GET PAGE FROM QUERY PARAM
    this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam && qParam.get('page')) {
        this.currentPage = Number(qParam.get('page'));
      } else {
        this.currentPage = 1;
      }

      // Base Data
      this.getAllSubCategory();
      this.getAllCategory();
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
            this.searchSubCategory = [];
            this.subcategory = this.holdPrevData;
            this.totalSubCategory = this.totalSubCategoryStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.SubCategoryPerPage),
            currentPage: Number(this.currentPage) - 1,
          };
          // Select
          const mSelect = {
            name: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: { createdAt: -1 },
          };

          return this.subcategoryService.getAllSubCategory(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.searchSubCategory = res.data;
          this.subcategory = this.searchSubCategory;
          this.totalSubCategory = res.count;
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
   * getAllSubCategory()
   * deleteSubCategoryById()
   */

  private getAllCategory() {
    // Select
    const mSelect = {
      name: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: { name: 1 },
    };

    this.subDataOne = this.categoryService
      .getAllCategory(filterData, null)
      .subscribe({
        next: (res) => {
          this.categories = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  private getAllSubCategory() {
    // Select
    const mSelect = {
      name: 1,
      category: 1,
      code: 1,
      description: 1,
      createdAt: 1,
    };

    const filter: FilterData = {
      filter: this.filter,
      pagination: null,
      select: mSelect,
      sort: { createdAt: -1 },
    };

    this.subDataTwo = this.subcategoryService
      .getAllSubCategory(filter, null)
      .subscribe({
        next: (res) => {
          // console.log(res)
          if (res.success) {
            this.subcategory = res.data;
            this.subcategoryCount = res.count;
            this.holdPrevData = this.subcategory;
            this.totalSubCategoryStore = this.subcategoryCount;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  deleteSubCategoryById(id: any) {
    this.subDataThree = this.subcategoryService
      .deleteSubCategoryById(id)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.uiService.warn(`Sub Category Deleted`);
            this.reloadService.needRefreshSubCategory$();
            this.router.navigate(['/product/', 'sub-category-list']);
          } else {
            this.uiService.warn(res.message);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  private deleteMultipleSubCategoryById() {
    this.spinner.show();
    this.subDataTwo = this.subcategoryService
      .deleteMultipleSubCategoryById(this.selectedIds)
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
              this.getAllSubCategory();
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
      case 'category': {
        this.filter = { ...this.filter, ...{ 'category._id': value } };
        this.activeFilter1 = index;
        break;
      }
      case 'sub-category': {
        this.filter = { ...this.filter, ...{ 'sub-category._id': value } };
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
      this.getAllSubCategory();
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

      const qData = { createdAtString: { $gte: startDate, $lte: endDate } };
      this.filter = { ...this.filter, ...qData };
      // const index = this.filter.findIndex(x => x.hasOwnProperty('createdAt'));

      if (this.currentPage > 1) {
        this.router.navigate([], { queryParams: { page: 1 } });
      } else {
        this.getAllSubCategory();
      }
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllSubCategory();
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
    const currentPageIds = this.subcategory.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.subcategory.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.subcategory.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }
  private checkSelectionData() {
    let isAllSelect = true;
    this.subcategory.forEach((m) => {
      if (!m.select) {
        isAllSelect = false;
      }
    });

    this.matCheckbox.checked = isAllSelect;
  }

  onSelectShowPerPage(val) {
    this.SubCategoryPerPage = val;
    this.getAllSubCategory();
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
   * EXPORTS TO EXCEL
   * exportToExcel()
   */

  exportToAllExcel() {
    console.log("dfd")
    const date = this.utilsService.getDateString(new Date());

    // Select
    const mSelect = {
      name: 1,
      category: 1,
      description: 1,
      createdAt: 1
    }

    const filterData: FilterData = {
      filter: null,
      select: mSelect,
      sort: this.sortQuery
    }


    this.subDataOne = this.subcategoryService.getAllSubCategory(filterData, this.searchQuery)
      .subscribe({
        next: (res => {
          const subscriptionReports = res.data;

          const mData = subscriptionReports.map(m => {
            return {
              'Subcategory Name': m.name,
              'Category Name': m.category.name,
              Description: m.description,
              createdAt: this.utilsService.getDateString(m.createdAt),
            }
          })

          // console.warn(mData)
          // EXPORT XLSX
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, `Sub_Category_Reports_${date}.xlsx`);
        }),
        error: (error => {
          console.log(error);
        })
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
            this.deleteMultipleSubCategoryById();
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

    if (this.subDataThree) {
      this.subDataThree.unsubscribe();
    }

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }

    if (this.subForm) {
      this.subForm.unsubscribe();
    }
  }
}
