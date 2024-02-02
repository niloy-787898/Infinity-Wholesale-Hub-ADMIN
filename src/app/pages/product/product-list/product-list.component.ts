import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CategoryService} from '../../../services/common/category.service';
import {UiService} from '../../../services/core/ui.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ReloadService} from '../../../services/core/reload.service';
import {EMPTY, Subscription} from 'rxjs';
import {Product, ProductCalculation} from '../../../interfaces/common/product.interface';
import {ProductService} from '../../../services/common/product.service';
import {FilterData} from '../../../interfaces/gallery/filter-data';
import {Category} from '../../../interfaces/common/category.interface';
import {Brand} from '../../../interfaces/common/brand.interface';
import {Unit} from '../../../interfaces/common/unit.interface';
import {BrandService} from '../../../services/common/brand.service';
import {UnitService} from '../../../services/common/unit.service';
import {debounceTime, distinctUntilChanged, pluck, switchMap} from 'rxjs/operators';
import {Pagination} from 'src/app/interfaces/core/pagination';
import {FormControl, FormGroup, NgForm} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {UtilsService} from 'src/app/services/core/utils.service';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {AdminPermissions} from 'src/app/enum/admin-permission.enum';
import {ConfirmDialogComponent} from 'src/app/shared/components/ui/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {NgxSpinnerService} from 'ngx-spinner';
import {AdminService} from 'src/app/services/admin/admin.service';
import * as XLSX from 'xlsx';
import {VendorService} from "../../../services/common/vendor.service";
import {Vendor} from "../../../interfaces/common/vendor.interface";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Data Form
  dataForm?: FormGroup;

  // Store Data
  toggleMenu: boolean = false;
  id?: string;
  productCount = 0;
  products?: Product[] = [];
  categories: Category[] = [];
  holdPrevData: Product[] = [];
  brands: Brand[] = [];
  vendors: Vendor[] = [];
  units: Unit[] = [];
  productCalculation: ProductCalculation;
  isLoading: boolean = true;

  // Pagination
  currentPage = 1;
  totalProducts = 0;
  productsPerPage = 25;
  totalProductsStore = 0;

  // FilterData
  filter: any = null;
  sortQuery: any = null;
  activeFilter1: number = null;
  activeFilter2: number = null;
  activeFilter3: number = null;
  activeFilter4: number = null;
  activeSort: number;

  showPerPageList = [{num: '25'}, {num: '50'}, {num: '100'}, {num: '500'}, {num: '1000'}];

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
  searchProducts: Product[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subDataFive: Subscription;
  private subDataSix: Subscription;
  private subDataSeven: Subscription;
  private subForm: Subscription;
  private subRouteOne: Subscription;

  constructor(
    private productService: ProductService,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private vendorService: VendorService,
    private dialog: MatDialog,
    private unitService: UnitService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    // Reload Data
    this.reloadService.refreshProduct$.subscribe(() => {
      this.getAllProducts();
    });

    // GET PAGE FROM QUERY PARAM
    this.subRouteOne = this.activatedRoute.queryParamMap.subscribe((qParam) => {
      if (qParam && qParam.get('page')) {
        this.currentPage = Number(qParam.get('page'));
      } else {
        this.currentPage = 1;
      }
      this.getAllProducts();
    });

    // Base Data
    this.getAllCategory();
    this.getAllVendors();
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
            this.products = this.holdPrevData;
            this.totalProducts = this.totalProductsStore;
            this.searchQuery = null;
            return EMPTY;
          }
          const pagination: Pagination = {
            pageSize: Number(this.productsPerPage),
            currentPage: Number(this.currentPage) - 1,
          };

          // Select
          const mSelect = {
            images: 1,
            name: 1,
            sku: 1,
            category: 1,
            brand: 1,
            price: 1,
            unit: 1,
            model: 1,
            quantity: 1,
            purchasePrice: 1,
            salePrice: 1,
            status: 1,
            createdAt: 1,
          };

          const filterData: FilterData = {
            pagination: pagination,
            filter: this.filter,
            select: mSelect,
            sort: {createdAt: -1},
          };

          return this.productService.getAllProducts(
            filterData,
            this.searchQuery
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.searchProducts = res.data;

          console.log('this is response,searchProducts', this.searchProducts);

          this.products = this.searchProducts;
          this.totalProducts = res.count;
          this.totalProductsStore = res.count;
          this.currentPage = 1;
          this.router.navigate([], {queryParams: {page: this.currentPage}});
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  private insertManyProducts(products) {

    this.subDataFive = this.productService.insertManyProducts(products).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.success(res.message);
          this.router.navigate(['/product/', 'product-list']);
        } else {
          this.uiService.warn(res.message);
        }
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

  private getAdminBaseData() {
    this.adminId = this.adminService.getAdminId();
    this.role = this.adminService.getAdminRole();
    this.permissions = this.adminService.getAdminPermissions();
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
    const currentPageIds = this.products.map((m) => m._id);
    if (event.checked) {
      this.selectedIds = this.utilsService.mergeArrayString(
        this.selectedIds,
        currentPageIds
      );
      this.products.forEach((m) => {
        m.select = true;
      });
    } else {
      currentPageIds.forEach((m) => {
        this.products.find((f) => f._id === m).select = false;
        const i = this.selectedIds.findIndex((f) => f === m);
        this.selectedIds.splice(i, 1);
      });
    }
  }

  private checkSelectionData() {
    let isAllSelect = true;
    this.products.forEach((m) => {
      if (!m.select) {
        isAllSelect = false;
      }
    });

    this.matCheckbox.checked = isAllSelect;
  }

  /**
   * HTTP REQ HANDLE
   * getAllProducts()
   * deleteMultipleProductById()
   * deleteProductById()
   * getAllCategory()
   * getAllBrands()
   * getAllUnits()
   */

  private getAllProducts() {
    // Spinner..
    this.spinner.show();
    const pagination: Pagination = {
      pageSize: Number(this.productsPerPage),
      currentPage: Number(this.currentPage) - 1,
    };

    const filter: FilterData = {
      filter: this.filter,
      pagination: pagination,
      select: {
        name: 1,
        sku: 1,
        category: 1,
        model: 1,
        price: 1,
        createdAt:1,
        createdAtString:1,
        quantity: 1,
        purchasePrice: 1,
        salePrice: 1,
      },
      sort: this.sortQuery ? this.sortQuery : {createdAt: -1},
    };

    this.subDataOne = this.productService
      .getAllProducts(filter, this.searchQuery)
      .subscribe({
        next: (res) => {
          // Spinner..
          this.isLoading = false;
          this.spinner.hide();

          if (res.success) {
            this.products = res.data;
            this.holdPrevData = res.data;
            this.productCount = res.count;
            this.totalProductsStore = res.count;
            this.productCalculation = res.calculation;

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
    this.subDataTwo = this.productService
      .deleteMultipleProductById(this.selectedIds)
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.success) {
            this.selectedIds = [];
            this.uiService.success(res.message);
            // fetch Data
            if (this.currentPage > 1) {
              this.router.navigate([], {queryParams: {page: 1}});
            } else {
              this.getAllProducts();
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

  deleteProductById(id: any) {
    this.subDataThree = this.productService.deleteProductById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`Product Deleted`);
          this.reloadService.needRefreshBrand$();
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // private deleteMultipleProductById() {
  //   this.spinner.show();
  //   this.subDataFour = this.productService.deleteMultipleProductById(this.selectedIds)
  //     .subscribe(res => {
  //       this.spinner.hide();
  //       if (res.success) {
  //         this.selectedIds = [];
  //         this.uiService.success(res.message);
  //         // fetch Data
  //         if (this.currentPage > 1) {
  //           this.router.navigate([], {queryParams: {page: 1}});
  //         } else {
  //           this.getAllProducts();
  //         }
  //       } else {
  //         this.uiService.warn(res.message)
  //       }

  //     }, error => {
  //       this.spinner.hide()
  //       console.log(error);
  //     });
  // }

  private getAllCategory() {
    // Select
    const mSelect = {
      name: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: {name: 1},
    };

    this.subDataFour = this.categoryService
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

  private getAllBrands() {
    // Select
    const mSelect = {
      name: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: {name: 1},
    };

    this.subDataFive = this.brandService
      .getAllBrands(filterData, null)
      .subscribe({
        next: (res) => {
          this.brands = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  private getAllUnits() {
    // Select
    const mSelect = {
      name: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: {name: 1},
    };

    this.subDataSix = this.unitService.getAllUnits(filterData, null).subscribe({
      next: (res) => {
        this.units = res.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getAllVendors() {
    // Select
    const mSelect = {
      name: 1,
      phone:1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: {name: 1},
    };

    this.subDataSeven = this.vendorService.getAllVendors(filterData, null).subscribe({
      next: (res) => {
        this.vendors = res.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
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
        this.filter = {...this.filter, ...{'category._id': value}};
        this.activeFilter1 = index;
        break;
      }
      case 'brand': {
        this.filter = {...this.filter, ...{'brand._id': value}};
        this.activeFilter2 = index;
        break;
      }
      case 'unit': {
        this.filter = {...this.filter, ...{'unit._id': value}};
        this.activeFilter3 = index;
        break;
      }
      case 'vendor': {
        this.filter = {...this.filter, ...{'vendor._id': value}};
        this.activeFilter3 = index;
        break;
      }
      default: {
        break;
      }
    }
    // Re fetch Data
    if (this.currentPage > 1) {
      this.router.navigate([], {queryParams: {page: 1}});
    } else {
      this.getAllProducts();
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

      const qData = {createdAtString: {$gte: startDate, $lte: endDate}};
      this.filter = {...this.filter, ...qData};
      // const index = this.filter.findIndex(x => x.hasOwnProperty('createdAt'));

      if (this.currentPage > 1) {
        this.router.navigate([], {queryParams: {page: 1}});
      } else {
        this.getAllProducts();
      }
    }
  }

  sortData(query: any, type: number) {
    this.sortQuery = query;
    this.activeSort = type;
    this.getAllProducts();
  }

  public onPageChanged(event: any) {
    this.router.navigate([], {queryParams: {page: event}});
  }

  onSelectShowPerPage(val) {
    this.productsPerPage = val;
    this.getAllProducts();
  }

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
      this.getAllProducts();
    }
  }


  /**
   * EXPORTS TO EXCEL
   * exportToExcel()
   */

  exportToAllExcel() {
    const date = this.utilsService.getDateString(new Date());

    this.spinner.show();

    // Select
    const mSelect = {
      images: 1,
      name: 1,
      sku: 1,
      category: 1,
      brand: 1,
      price: 1,
      model:1,
      unit: 1,
      quantity: 1,
      purchasePrice: 1,
      salePrice: 1,
      status: 1,
      createdAt: 1,
      productId: 1
    }

    const filterData: FilterData = {
      filter: this.filter,
      select: mSelect,
      sort: this.sortQuery,
      pagination: null,
    }


    this.subDataOne = this.productService.getAllProducts(filterData, this.searchQuery)
      .subscribe({
        next: (res => {
          const subscriptionReports = res.data;

          const mData = subscriptionReports.map(m => {
            return {
              productId: m.productId,
              'Brand Name': m.name,
              'Item': m?.category?.name,
              code: m.sku,
              model: m.model,
              purchasePrice: m?.purchasePrice,
              salePrice: m?.salePrice,
              Qty: m?.quantity,
              // 'T T.P' : m?.purchasePrice * m?.quantity,
              // 'Total Amount' : m?.salePrice * m?.quantity,
              createdAt: this.utilsService.getDateString(m.createdAt),
            }
          })
          // EXPORT XLSX
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, `Products_Data_${date}.xlsx`);

          this.spinner.hide();
        }),
        error: (error => {
          this.spinner.hide();
          console.log(error);
        })
      });
  }


  /**
   * IMPORT EXCEL DATA
   * FILE CHANGE EVENT
   */

  onFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];

    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});

      // Modify Attributes
      const products = jsonData.products;
      console.log(products);

      this.insertManyProducts(products);
    };
    reader.readAsBinaryString(file);
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
  // public openConfirmDialog(type: string, data?: any) {
  //   switch(type) {
  //     case 'delete': {
  //       const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //         maxWidth: '400px',
  //         data: {
  //           title: 'Confirm Delete',
  //           message: 'Are you sure you want delete this data?'
  //         }
  //       });
  //       dialogRef.afterClosed().subscribe(dialogResult => {
  //         if (dialogResult) {
  //           // this.deleteMultipleProductById();
  //         }
  //       });
  //       break;
  //     }
  //     // case 'edit': {
  //     //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     //     maxWidth: '400px',
  //     //     data: {
  //     //       title: 'Confirm Edit',
  //     //       message: 'Are you sure you want edit this data?'
  //     //     }
  //     //   });
  //     //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     //     if (dialogResult) {
  //     //       this.updateMultipleProductById(data);
  //     //     }
  //     //   });
  //     //   break;
  //     // }
  //     // case 'clone': {
  //     //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     //     maxWidth: '400px',
  //     //     data: {
  //     //       title: 'Confirm Clone',
  //     //       message: 'Are you sure you want clone this data?'
  //     //     }
  //     //   });
  //     //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     //     if (dialogResult) {
  //     //       this.cloneSingleProduct(data);
  //     //     }
  //     //   });
  //     //   break;
  //     // }
  //     default: {
  //       break;
  //     }
  //   }

  // }

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

    if (this.subDataFour) {
      this.subDataFour.unsubscribe();
    }

    if (this.subDataFive) {
      this.subDataFive.unsubscribe();
    }

    if (this.subDataSix) {
      this.subDataSix.unsubscribe();
    }

    if (this.subDataSeven) {
      this.subDataSeven.unsubscribe();
    }

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }

    if (this.subForm) {
      this.subForm.unsubscribe();
    }
  }
}
