import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminPermissions} from "../../../enum/admin-permission.enum";
import {NewSales} from "../../../interfaces/common/new-sales.interface";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {debounceTime, distinctUntilChanged, EMPTY, pluck, Subscription, switchMap} from "rxjs";
import {CustomerService} from "../../../services/common/customer.service";
import {NewSalesService} from "../../../services/common/new-sales.service";
import {UiService} from "../../../services/core/ui.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ReloadService} from "../../../services/core/reload.service";
import {UtilsService} from "../../../services/core/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {NgxSpinnerService} from "ngx-spinner";
import {Pagination} from "../../../interfaces/core/pagination";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {ConfirmDialogComponent} from "../../../shared/components/ui/confirm-dialog/confirm-dialog.component";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AdminService } from 'src/app/services/admin/admin.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-my-sales-report',
  templateUrl: './my-sales-report.component.html',
  styleUrls: ['./my-sales-report.component.scss']
})
export class MySalesReportComponent implements OnInit {

  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  toggleMenu: boolean = false;
  id?: string;
  sales: NewSales[] = [];
  holdPrevData: NewSales[] = [];
  newSalesCount = 0;
  isLoading: boolean = true;
  USER_ROLE: any;

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
  searchProducts: NewSales[] = [];

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
    private newSalesService: NewSalesService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
  ) {

    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  ngOnInit(): void {

    this.USER_ROLE = this.adminService.getAdminRole();
    if(this.USER_ROLE === 'super_admin'){
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
    else if(this.USER_ROLE === 'salesman'){
      if(this.USER_ROLE === 'super_admin'){
        this.filter
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
    }

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

          return this.newSalesService.getAllNewSales(
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
        products:1,
        subTotal: 1,
        discountAmount: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.newSalesService
      .getAllNewSales(filter, null)
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
    this.subDataTwo = this.newSalesService
      .deleteMultipleSalesById(this.selectedIds)
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
   * Invoice PDF
   */

  // async downloadPdfInvoice(type?: string, m?: NewSales) {
  //   console.log('m----------', m);
  //
  //   const documentDefinition = await this.getInvoiceDocument(m);
  //
  //   if (type === 'download') {
  //     pdfMake.createPdf(documentDefinition).download(`Invoice_${m?.invoiceNo}.pdf`);
  //   } else if (type === 'print') {
  //     pdfMake.createPdf(documentDefinition).print();
  //   } else {
  //     pdfMake.createPdf(documentDefinition).download(`Invoice_${m?.invoiceNo}.pdf`);
  //   }
  //
  // }


  private async getInvoiceDocument(m: NewSales) {
    console.log('invoice', m);
    const documentObject = {
      content: [
        {
          columns: [
            await this.getProfilePicObjectPdf(),
            [
              {
                width: 'auto',
                text: ``,
                style: 'p',
              },
              {
                width: 'auto',
                text: ``,
                style: 'p',
              },
              {
                width: 'auto',
                text: ``,
                style: 'p',
              },
              {
                width: 'auto',
                text: ``,
                style: 'p',
              },
            ],
            [
              {
                width: '*',
                text: [
                  `Invoice ID: `,
                  {
                    text: m?.invoiceNo,
                    bold: true
                  }
                ],
                style: 'p',
                alignment: 'right'
              },
              {
                width: '*',
                text: `${this.utilsService.getDateString(m.soldDate, 'll')}`,
                style: 'p',
                alignment: 'right'
              },
            ]
          ],
          columnGap: 16
        }, // END TOP INFO SECTION
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 535,
              y2: 5,
              lineWidth: 0.5,
              lineColor: '#E8E8E8'
            }
          ]
        }, // END TOP INFO BORDER
        {
          columns: [
            [
              // {
              //   width: 'auto',
              //   text: [
              //     `Salesman Id: `,
              //     {
              //       text: '#' + m?.salesmanId,
              //       bold: true
              //     }
              //   ],
              //   style: 'p',
              // },
              // {
              //   width: 'auto',
              //   text: `Customer Info`,
              //   style: 'p',
              //   margin: [0, 8, 0, 0]
              // },
              // {
              //   width: 'auto',
              //   text: [
              //     `Customer Id: `,
              //     {
              //       text: '#' + m?.customerId,
              //       bold: true
              //     }
              //   ],
              //   style: 'p',
              // },
              // {
              //   width: 'auto',
              //   text: `Date Added: ${this.utilsService.getDateString(new Date(), 'll')}`,
              //   style: 'p',
              // },
              {
                width: 'auto',
                text: [
                  `Customer Name: `,
                  {
                    text: m.customer ? m.customer?.name : 'n/a',
                    bold: true
                  }
                ],
                style: 'p',
                margin: [0, 5, 0, 0]
              },
              {
                width: 'auto',
                text: [
                  `Customer Phone Number: `,
                  {
                    text: m.customer ? m.customer?.phone : 'n/a',
                    bold: true
                  }
                ],
                style: 'p',
              },
              {
                width: 'auto',
                text: [
                  `Customer Address: `,
                  {
                    text: m.customer ? m.customer?.address : 'n/a',
                    bold: true
                  }
                ],
                style: 'p',
              },
            ],
            {
              width: '*',
              alignment: 'left',
              text: '',
            },
          ],
          columnGap: 16
        },
        {
          style: 'gapY',
          columns: [
            this.getItemTable(m),
          ]
        }, // END ITEM TABLE SECTION
        {
          style: 'gapY',
          columns: [
            {
              width: '*',
              alignment: 'left',
              text: '',
            }, // Middle Space for Make Column Left & Right
            [
              this.getCalculationTable(m)
            ]
          ]
        }, // END CALCULATION SECTION
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 535,
              y2: 5,
              lineWidth: 0.5,
              lineColor: '#E8E8E8'
            }
          ]
        }, // END TOP INFO BORDER
        {
          style: 'gapXY',
          margin: [0, 200, 0, 0],
          columns: [
            [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 100,
                    y2: 5,
                    lineWidth: 1,
                    lineColor: '#767676',
                  }
                ]
              },
              {
                width: 'auto',
                text: [
                  `Received By `,
                ],
                style: 'p',
                margin: [22, 10]
              }
            ],
            {
              width: '*',
              alignment: 'left',
              text: '',
            }, // Middle Space for Make Column Left & Right
            [
              {
                alignment: 'right',
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 100,
                    y2: 5,
                    lineWidth: 1,
                    lineColor: '#767676',
                  }
                ]
              },
              {
                width: '100',
                text: [
                  `Authorized By `,
                ],
                style: 'p',
                alignment: 'right',
                margin: [22, 10]
              }
            ],

          ],

        },
        {
          width: '*',
          text: [
            `CB, 209/1, Kachukhet Main Road, Dhaka Cantt. Dhaka-1206, Phone: 017625533/01762555544, sunelectronicsdhaka@gmail.com `
          ],
          style: 'p',
          margin: [0, 60, 0, 0],
          alignment: 'center',
        },
        // {
        //   width: '*',
        //   text: [
        //     `Mirpur 14, Dhaka `
        //   ],
        //   style: 'p',
        //   alignment: 'center',
        // },
        // {
        //   width: '*',
        //   text: [
        //     `Telephone: +880 ---`
        //   ],
        //   style: 'p',
        //   alignment: 'center',
        // },
        // {
        //   width: '*',
        //   text: [
        //     `Email: info@sunelectronics.softlabit.com`
        //   ],
        //   style: 'p',
        //   alignment: 'center',
        // },
        {
          text: 'Thank you for your purchase',
          style: 'p',
          alignment: 'center',
          margin: [0, 10]
        },
      ],
      styles: this.pdfMakeStyleObject
    };


    return documentObject;
  }


  async getProfilePicObjectPdf() {
    return {
      image: await this.getBase64ImageFromURL('https://ftp.softlabit.com/uploads/logo/sun-pos.png'),
      width: 200,
      alignment: 'left'
    };
  }

  getBase64ImageFromURL(url): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }


  dataTableForPdfMake(m: NewSales) {
    const tableHead = [
      {
        text: 'SL',
        style: 'tableHead',
        // border: [true, true, true, true],
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
      {
        text: 'Name',
        style: 'tableHead',
        // border: [true, true, true, true],
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
      {
        text: 'Product Code',
        style: 'tableHead',
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
      {
        text: 'Sold Quantity',
        style: 'tableHead',
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
      {
        text: 'Unit Price',
        style: 'tableHead',
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
      {
        text: 'Total',
        style: 'tableHead',
        fillColor: '#DEDEDE',
        borderColor: ['#eee', '#eee', '#eee', '#eee'],
      },
    ];

    const finalTableBody = [tableHead];

    m.products.forEach((s, i) => {
      const res = [
        {
          text: i + 1,
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
        {
          text: `${s.name} (${s.model || ""}, ${s.others || ""})`,
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
        {
          text: s.sku,
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
        {
          text: s.soldQuantity,
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
        {
          text: s.salePrice,
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
        {
          text: (s.salePrice * s.soldQuantity),
          style: 'tableBody',
          borderColor: ['#eee', '#eee', '#eee', '#eee'],
        },
      ];
      // @ts-ignore
      finalTableBody.push(res);
    });


    return finalTableBody;

  }


  getItemTable(m: NewSales) {
    return {
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: this.dataTableForPdfMake(m)
      }
    };
  }

  getCalculationTable(m: NewSales) {
    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            {
              text: 'Sub Total',
              style: 'tableHead',
              // border: [true, true, true, true],
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            },
            {
              text: `${m?.subTotal} TK`,
              style: 'tableBody',
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            }
          ],
          [
            {
              text: 'Discount(-)',
              style: 'tableHead',
              // border: [true, true, true, true],
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            },
            {
              text: `${m?.discountAmount || 0} TK`,
              style: 'tableBody',
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            }
          ],
          [
            {
              text: 'Total',
              style: 'tableHead',
              // border: [true, true, true, true],
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            },
            {
              text: `${m?.total} TK`,
              style: 'tableBody',
              borderColor: ['#eee', '#eee', '#eee', '#eee'],
            }
          ],
        ]
      }
    };
  }

  get pdfMakeStyleObject(): object {
    return {
      p: {
        fontSize: 9,
      },
      pBn: {
        fontSize: 9,
        lineHeight: 2
      },
      tableHead: {
        fontSize: 9,
        bold: true,
        margin: [5, 2],
      },
      tableBody: {
        fontSize: 9,
        margin: [5, 2],
      },
      gapY: {
        margin: [0, 8]
      },
      gapXY: {
        margin: [0, 40]
      }

    };
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
