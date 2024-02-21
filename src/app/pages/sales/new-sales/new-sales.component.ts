import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { NewSales } from '../../../interfaces/common/new-sales.interface';
import { UiService } from '../../../services/core/ui.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewSalesService } from '../../../services/common/new-sales.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { Customer } from '../../../interfaces/common/customer.interface';
import { CustomerService } from '../../../services/common/customer.service';
import { ProductService } from 'src/app/services/common/product.service';
import { Product } from 'src/app/interfaces/common/product.interface';
import { SaleConfirmComponent } from '../../../shared/dialog-view/sale-confirm/sale-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { UtilsService } from '../../../services/core/utils.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-new-sales',
  templateUrl: './new-sales.component.html',
  styleUrls: ['./new-sales.component.scss'],
})
export class NewSalesComponent implements OnInit {
  // Data Form
  @ViewChild('formElement') formElement: NgForm;

  dataForm?: FormGroup;
  disable = false;
  totalProducts: number;

  // SEARCH AREA
  overlay = false;
  isOpen = false;
  isFocused = false;
  isLoading = false;
  isSelect = false;
  searchProducts: Product[] = [];
  searchQuery = null;
  @ViewChild('searchForm') searchForm: NgForm;
  @ViewChild('searchInput') searchInput: ElementRef;

  // Store Data
  id?: string;
  newSales?: NewSales;
  customers?: Customer[] = [];
  customer: Customer;
  customerInfo = false;
  search = false;
  discount: number = 0;
  discountPercent: number = 0;
  shippingCharge: number = 0;
  subTotal: number = 0;
  total: number = 0;
  soldDate: Date = new Date();

  // FilterData
  filterCustomer: any = null;
  sortQuery: any = null;

  //Store Components Data
  products: Product[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subDataFive: Subscription;
  private subForm: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private newSalesService: NewSalesService,
    private router: Router,
    private dialog: MatDialog,
    private utilsService: UtilsService
  ) {
    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    // Init Data Form
    this.initDataForm();

    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getNewSalesById();
      }
    });
    this.getAllCustomers();
  }

  /**
   * FORM METHODS
   * initDataForm()
   * setFormValue()
   * onSubmit()
   */

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      phone: new FormControl({ value: null, disabled: false }, [
        Validators.minLength(11),
      ]),
      address: [null],
    });
  }

  private setFormValue() {
    if (this?.newSales.customer?.phone) {
      this.dataForm.patchValue({ ...this.newSales.customer });
      this.customerInfo = true;
    }
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn('Please Add Customer name and phone number');
      return;
    }

    if (!this.newSales && !this.products.length) {
      this.uiService.warn('Please Add some products to continue sales');
      return;
    }
    let totalPurchasePrice;

    this.products.filter((m) => {
      console.log(m);
      totalPurchasePrice += m.salePrice * m.soldQuantity;
    });

    const mData = {
      customer: this.dataForm.valid ? { ...this.dataForm.value } : null,
      products: this.products,
      soldDate: this.soldDate,
      discountAmount: this.discount,
      discountPercent: this.discountPercent,
      shippingCharge: this.shippingCharge,
      total: this.total,
      subTotal: this.subTotal,
      totalPurchasePrice: totalPurchasePrice,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };

    if (this.newSales) {
      this.updateNewSalesById();
    } else {
      // this.openConfirmDialog(mData)
      this.addNewSales();

      // Specify the delay time in milliseconds
      const delayMilliseconds = 3000; // 2 seconds

      setTimeout(() => {
        this.router.navigate(['/sales/sales-list']);
      }, delayMilliseconds);
    }
  }

  customerInfoToggle() {
    this.customerInfo = !this.customerInfo;
  }

  /**
   * HTTP REQ HANDLE
   * getNewSalesById()
   * addNewSales()
   * updateNewSalesById()
   */

  private getAllCustomers() {
    // Select
    const mSelect = {
      name: 1,
      slug: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: { name: 1 },
    };

    this.subDataOne = this.customerService
      .getAllCustomers(filterData, null)
      .subscribe({
        next: (res) => {
          this.customers = res.data;
          // if (this.id) {
          //   const customer = this.customers.find(f => f._id === this.newSales.customer._id);
          //   this.dataForm.patchValue({ customer: customer._id });
          // }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  private addNewSales(type?: string) {
    this.spinnerService.show();

    let totalPurchasePrice: number = 0;

    this.products.filter((m) => {
      console.log(m);
      totalPurchasePrice += m.purchasePrice * m.soldQuantity;
    });

    const mData = {
      customer: { ...this.dataForm.value } || null,
      products: this.products,
      soldDate: this.soldDate,
      discountAmount: this.discount,
      discountPercent: this.discountPercent,
      shippingCharge: this.shippingCharge,
      total: this.total,
      subTotal: this.subTotal,
      totalPurchasePrice: totalPurchasePrice,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };

    this.subDataFive = this.newSalesService.addNewSales(mData).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.success) {
          this.uiService.success(res.message);
          this.formElement.resetForm();
          this.products = [];
          this.discount = 0;
          this.discountPercent = 0;
          this.shippingCharge = 0;
          this.total = 0;
          this.subTotal = 0;
          mData['invoiceNo'] = res.data.invoiceNo;
          if (type === 'print') {
            this.downloadPdfInvoice('print', mData);
          }
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        console.log(error);
      },
    });
  }

  private getNewSalesById() {
    // Select
    const mSelect = {
      name: 1,
      slug: 1,
    };

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: { name: 1 },
    };

    this.spinnerService.show();
    this.subDataThree = this.newSalesService
      .getNewSalesById(this.id)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.data) {
            this.newSales = res.data;
            this.soldDate = new Date(this.newSales.soldDate);
            this.products = this.newSales.products;
            this.subTotal = this.newSales.subTotal;
            this.total = this.newSales.total;
            this.discount = this.newSales.discountAmount;
            this.discountPercent = this.newSales.discountPercent;
            this.shippingCharge = this.newSales.shippingCharge;
            console.log(this.newSales);
            this.setFormValue();
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          console.log(error);
        },
      });
  }

  private updateNewSalesById() {
    this.spinnerService.show();

    const mData = {
      customer: { ...this.dataForm.value } || null,
      products: this.products,
      soldDate: this.soldDate,
      discountAmount: this.discount,
      discountPercent : this.discountPercent,
      shippingCharge : this.shippingCharge,
      total: this.total,
      subTotal: this.subTotal,
      invoiceNo: this.newSales.invoiceNo,
    };

    this.subDataFour = this.newSalesService
      .updateNewSalesById(this.newSales._id, mData)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/sales/', 'sales-list']);
          } else {
            this.uiService.warn(res.message);
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          console.log(error);
        },
      });
  }

  /**
   * HANDLE SEARCH COMPONENT DATA
   * onSelectCustomerList()
   * onSelectProduct()
   */
  calculateTotal() {
    // Calculate the value of the percentage discount
    const percentageDiscountValue = (this.discountPercent / 100) * this.subTotal;

    // Apply both discounts and shipping charge to calculate the total
    // Ensure to not allow the total to become negative
    this.total = Math.max(0, this.subTotal - this.discount - percentageDiscountValue + this.shippingCharge);
  }


  onSelectCustomerList(data: Customer) {
    this.customer = data;
    this.dataForm.patchValue(this.customer);
    console.log('this.customer', this.customer);
  }


  onSelectProduct(data: Product) {
    this.subTotal += data?.salePrice;
    this.calculateTotal();
    this.products.push({ ...data, ...{ soldQuantity: 1 } });
  }

  // Sales Data and Calculation handeling
  increaseQuantity(data: Product) {
    if (this.newSales) {
      this.uiService.warn("You can't increase product quantity on return sale");
    } else {
      this.products = this.products.map((m) => {
        if (m._id === data._id) {
          if (m.quantity > m.soldQuantity) {
            m.soldQuantity++;
            this.subTotal += data?.salePrice;
            this.calculateTotal();
          } else {
            this.uiService.warn("You can't add more quantity");
          }
        }
        return m;
      });
    }
  }
  changeQuantity(newQuantity: number, data: Product) {
    if (this.newSales) {
      this.uiService.warn("You can't change product quantity on a new sale");
    } else {
      this.products = this.products.map((m) => {
        if (m._id === data._id) {
          if (newQuantity >= 0) {
            const difference = newQuantity - m.soldQuantity;
            if (difference > 0) {
              // Increase quantity
              if (m.quantity >= m.soldQuantity + difference) {
                m.soldQuantity += difference;
                this.subTotal += difference * data?.salePrice;
                this.calculateTotal();
              } else {
                this.uiService.warn(
                  "You can't add more quantity than available in stock"
                );
              }
            } else if (difference < 0) {
              // Decrease quantity
              m.soldQuantity = newQuantity;
              this.subTotal += difference * data?.salePrice;
              this.calculateTotal();
            }
          } else {
            this.uiService.warn('Quantity cannot be less than zero');
          }
        }
        return m;
      });
    }
  }

  decreseQuantity(data: Product) {
    this.products = this.products.map((m) => {
      if (m._id === data._id) {
        if (m.soldQuantity > 1) {
          m.soldQuantity--;

          this.subTotal -= data?.salePrice;
          this.calculateTotal();
        }
      }
      return m;
    });
  }

  deleteProduct(data: Product) {
    console.log(data?.soldQuantity);
    this.subTotal -= data?.salePrice * data?.soldQuantity;
    this.calculateTotal();
    this.products = this.products.filter((m) => m._id != data._id);
  }

  onChangeDiscount(event) {
    this.discount = event;
    this.calculateTotal();

    if (event >= this.subTotal) {
      this.discount = this.subTotal;
    }
  }
  onChangeDiscountInPercentage(event) {
    this.discountPercent = event;
    this.calculateTotal();

    if (event >= this.subTotal) {
      this.discountPercent = this.subTotal;
    }
  }
  onChangeShippingCharge(event) {
    this.shippingCharge = event;
    this.calculateTotal();

    if (event >= this.subTotal) {
      this.shippingCharge = this.subTotal;
    }
  }
  onSoldDateChange(event) {
    console.log(event);
  }

  // Toggle
  disableToggle() {
    this.disable = !this.disable;
    console.log(this.disable);
  }

  /**
   * HANDLE SEARCH Area
   * onClickHeader()
   * onClickSearchArea()
   * handleOverlay()
   * handleFocus()
   * setPanelState()
   * handleOpen()
   * handleOutsideClick()
   * handleCloseOnly()
   * handleCloseAndClear()
   * onSelectItem()
   */

  onClickHeader(): void {
    this.handleCloseOnly();
  }

  onClickSearchArea(event: MouseEvent): void {
    event.stopPropagation();
  }

  handleOverlay(): void {
    this.overlay = false;
    this.isOpen = false;
    this.isFocused = false;
  }

  handleFocus(event: FocusEvent): void {
    this.searchInput.nativeElement.focus();

    if (this.isFocused) {
      return;
    }
    if (this.searchProducts.length > 0) {
      this.setPanelState(event);
    }
    this.isFocused = true;
  }

  private setPanelState(event: FocusEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = false;
    this.handleOpen();
  }

  handleOpen(): void {
    if (this.isOpen || (this.isOpen && !this.isLoading)) {
      return;
    }
    if (this.searchProducts.length > 0) {
      this.isOpen = true;
      this.overlay = true;
    }
  }

  handleOutsideClick(): void {
    if (!this.isOpen) {
      // this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.isFocused = false;
  }

  handleCloseOnly(): void {
    if (!this.isOpen) {
      this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.isFocused = false;
  }

  handleCloseAndClear(): void {
    if (!this.isOpen) {
      this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.searchProducts = [];
    this.isFocused = false;
  }

  onSelectItem(data: any): void {
    this.handleCloseAndClear();
    // this.router.navigate(['/product-details', data?._id]);
  }

  /**
   * COMPONENT DIALOG VIEW
   */
  public openConfirmDialog(data: any) {
    const dialogRef = this.dialog.open(SaleConfirmComponent, {
      data: data,
      maxWidth: '98%',
      minWidth: '750px',
      maxHeight: '90%',
      height: 'auto',
      panelClass: ['my-custom-dialog-class', 'my-class'],
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.addNewSales(dialogResult.type);
      }
    });
  }

  /**
   * Invoice PDF
   */

  async downloadPdfInvoice(type?: string, m?: NewSales) {
    console.log('m----------', m);

    const documentDefinition = await this.getInvoiceDocument(m);

    if (type === 'download') {
      pdfMake
        .createPdf(documentDefinition)
        .download(`Invoice_${m?.invoiceNo}.pdf`);
    } else if (type === 'print') {
      pdfMake.createPdf(documentDefinition).print();
    } else {
      pdfMake
        .createPdf(documentDefinition)
        .download(`Invoice_${m?.invoiceNo}.pdf`);
    }
  }

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
                    bold: true,
                  },
                ],
                style: 'p',
                alignment: 'right',
              },
              {
                width: '*',
                text: `${this.utilsService.getDateString(m.soldDate, 'll')}`,
                style: 'p',
                alignment: 'right',
              },
            ],
          ],
          columnGap: 16,
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
              lineColor: '#E8E8E8',
            },
          ],
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
                    bold: true,
                  },
                ],
                style: 'p',
                margin: [0, 5, 0, 0],
              },
              {
                width: 'auto',
                text: [
                  `Customer Phone Number: `,
                  {
                    text: m.customer ? m.customer?.phone : 'n/a',
                    bold: true,
                  },
                ],
                style: 'p',
              },
              {
                width: 'auto',
                text: [
                  `Customer Address: `,
                  {
                    text: m.customer ? m.customer?.address : 'n/a',
                    bold: true,
                  },
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
          columnGap: 16,
        },
        {
          style: 'gapY',
          columns: [this.getItemTable(m)],
        }, // END ITEM TABLE SECTION
        {
          style: 'gapY',
          columns: [
            {
              width: '*',
              alignment: 'left',
              text: '',
            }, // Middle Space for Make Column Left & Right
            [this.getCalculationTable(m)],
          ],
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
              lineColor: '#E8E8E8',
            },
          ],
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
                  },
                ],
              },
              {
                width: 'auto',
                text: [`Received By `],
                style: 'p',
                margin: [22, 10],
              },
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
                  },
                ],
              },
              {
                width: '100',
                text: [`Authorized By `],
                style: 'p',
                alignment: 'right',
                margin: [22, 10],
              },
            ],
          ],
        },
        {
          width: '*',
          text: [
            `CB, 209/1, Kachukhet Main Road, Dhaka Cantt. Dhaka-1206, Phone: 017625533/01762555544, sunelectronicsdhaka@gmail.com `,
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
          margin: [0, 10],
        },
      ],
      styles: this.pdfMakeStyleObject,
    };

    return documentObject;
  }

  async getProfilePicObjectPdf() {
    return {
      image: await this.getBase64ImageFromURL(
        'https://ftp.softlabit.com/uploads/logo/sun-pos.png'
      ),
      width: 200,
      alignment: 'left',
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

      img.onerror = (error) => {
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
          text: `${s.name} (${s.model || ''}, ${s.others || ''})`,
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
          text: s.salePrice * s.soldQuantity,
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
        body: this.dataTableForPdfMake(m),
      },
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
            },
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
            },
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
            },
          ],
        ],
      },
    };
  }

  get pdfMakeStyleObject(): object {
    return {
      p: {
        fontSize: 9,
      },
      pBn: {
        fontSize: 9,
        lineHeight: 2,
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
        margin: [0, 8],
      },
      gapXY: {
        margin: [0, 40],
      },
    };
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
    if (this.subDataFour) {
      this.subDataFour.unsubscribe();
    }
  }
}
