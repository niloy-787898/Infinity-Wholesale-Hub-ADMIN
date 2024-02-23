import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {Product} from "../../../interfaces/common/product.interface";
import {Customer} from "../../../interfaces/common/customer.interface";
import {Subscription} from "rxjs";
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomerService} from "../../../services/common/customer.service";
import {ProductService} from "../../../services/common/product.service";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {PreOderService} from "../../../services/common/pre-order.service";
import {PreOrder} from "../../../interfaces/common/pre-oder.interface";

@Component({
  selector: 'app-pre-order-add',
  templateUrl: './pre-order-add.component.html',
  styleUrls: ['./pre-order-add.component.scss']
})
export class PreOrderAddComponent implements OnInit {

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
  preOrder?: PreOrder;
  customers?: Customer[] = [];
  customer: Customer;
  customerInfo = false;
  search = false;
  discount: number = 0;
  advancePayment: number = 0;
  subTotal: number = 0;
  total: number = 0;
  soldDate: Date = new Date();
  advanceAmount: number = 0;

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
    private preOderService: PreOderService,
    private productService: ProductService,
    private router: Router,
  ) {
  }


  ngOnInit(): void {

    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getNewPreOderById();
      } else {
        this.getAllCustomers();
      }
    });
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
      phone: [null, Validators.required],
      address: [null],
    });
  }

  private setFormValue() {
    if (this?.preOrder.customer?.phone) {
      this.dataForm.patchValue({...this.preOrder.customer});
      this.customerInfo = true;
    }
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn('Please Add Customer name and phone number');
      return;
    }

    if (!this.products.length) {
      this.uiService.warn('Please Add some products to continue sales');
      return;
    }

    // const mData = {
    //   customer: { ...this.dataForm.value },
    //   products: this.products,
    //   soldDate: this.soldDate,
    //   discountAmount: this.discount,
    //   total: this.subTotal,
    //   subTotal: this.subTotal,
    //   advanceAmount: this.advanceAmount,
    // }

    // this.subDataFive = this.preOderService.addNewPreOder(mData).subscribe({
    //   next: (res) => {
    //     this.spinnerService.hide();
    //     if (res.success) {

    //       console.log(res)

    //       this.uiService.success(res.message);
    //       this.formElement.resetForm();
    //       this.router.navigate(['/sales/', 'pre-order-list']);
    //     } else {
    //       this.uiService.warn(res.message);
    //     }
    //   },
    //   error: (error) => {
    //     this.spinnerService.hide();
    //     console.log(error);
    //   },
    // });

    if (this.preOrder) {
      this.updateNewSalesById();
    } else {
      this.addNewSales();
    }

  }

  private updateNewSalesById() {
    this.spinnerService.show();

    const mData = {
      customer: { ...this.dataForm.value },
      products: this.products,
      soldDate: this.soldDate,
      discountAmount: this.discount,
      total: this.subTotal,
      subTotal: this.subTotal,
      advanceAmount: this.advanceAmount,
    }



    this.subDataFour = this.preOderService.updateNewPreOderById(this.preOrder._id, mData)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/sales/', 'pre-order-list']);
          } else {
            this.uiService.warn(res.message);
          }

        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private addNewSales() {
    this.spinnerService.show();

    const mData = {
      customer: { ...this.dataForm.value },
      products: this.products,
      soldDate: this.soldDate,
      discountAmount: this.discount,
      total: this.subTotal,
      subTotal: this.subTotal,
      advanceAmount: this.advanceAmount,
    }


    this.subDataFive = this.preOderService.addNewPreOder(mData).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.success) {

          console.log(res)

          this.uiService.success(res.message);
          this.formElement.resetForm();
          this.products = []
          this.discount = 0;
          this.total = 0
          this.subTotal = 0
          this.advanceAmount = 0;
          // this.router.navigate(['/sales/', 'sales-list']);
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
      slug: 1
    }

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: mSelect,
      sort: { name: 1 }
    }

    this.subDataOne = this.customerService.getAllCustomers(filterData, null)
      .subscribe({
        next: (res) => {
          this.customers = res.data;
          if (this.id) {
            const customer = this.customers.find(f => f._id === this.preOrder.customer._id);
            this.dataForm.patchValue({ customer: customer._id });
          }
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  private addNewPreOder() {
    this.spinnerService.show();
    this.subDataTwo = this.preOderService.addNewPreOder(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/sales/', 'sales-list']);
          } else {
            this.uiService.warn(res.message);
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private getNewPreOderById() {
    this.spinnerService.show();
    this.subDataThree = this.preOderService.getNewPreOderById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.preOrder = res.data;
            this.advanceAmount = this.preOrder.advanceAmount;
            this.soldDate = new Date(this.preOrder.soldDate);
            this.products = this.preOrder.products;
            this.subTotal = this.preOrder.subTotal;
            this.total = this.preOrder.total;
            this.discount = this.preOrder.discountAmount;
            this.getAllCustomers();
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateNewPreOderById() {
    this.spinnerService.show();
    this.subDataFour = this.preOderService.updateNewPreOderById(this.preOrder._id, this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/sales/', 'sales-list']);
          } else {
            this.uiService.warn(res.message);
          }

        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  /**
   * HANDLE SEARCH COMPONENT DATA
   * onSelectCustomerList()
   * onSelectProduct()
   */

  onSelectCustomerList(data: Customer) {
    this.customer = data;
    this.dataForm.patchValue(this.customer);
    console.log('this.customer', this.customer)
  }

  onSelectProduct(data: Product) {
    this.subTotal += data?.salePrice;
    this.total = this.subTotal - this.discount
    this.products.push({ ...data, ...{ soldQuantity: 1 } })
  }


  // Sales Data and Calculation handeling
  increaseQuantity(data: Product) {
    this.products = this.products.map((m) => {
      if (m._id === data._id) {
        m.soldQuantity++;
        this.subTotal += data?.salePrice;
        this.total = this.subTotal - this.discount
      }
      return m;
    })
    console.warn(this.products)
  }
  changeQuantity(newQuantity: number, data: Product) {
    if (this.products) {
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
                this.total = this.subTotal - this.discount
              } else {
                this.uiService.warn(
                  "You can't add more quantity than available in stock"
                );
              }
            } else if (difference < 0) {
              // Decrease quantity
              m.soldQuantity = newQuantity;
              this.subTotal += difference * data?.salePrice;
              this.total = this.subTotal - this.discount
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
          this.total = this.subTotal - this.discount
        }
      }
      return m;
    })
  }

  deleteProduct(data: Product) {
    this.products = this.products.filter((m) => m._id != data._id)
  }


  onChangeDiscount(event) {
    this.discount = event;
    this.total = this.subTotal - this.discount;

    if (event >= this.subTotal) {
      this.discount = this.subTotal;
    }
  }

  onChangeAdvanceAmount(event) {
    this.advanceAmount = event;
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
    if (this.isOpen || this.isOpen && !this.isLoading) {
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
    if (this.subForm) {
      this.subForm.unsubscribe();
    }
  }

}
