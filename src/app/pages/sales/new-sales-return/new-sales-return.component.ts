import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {Customer} from "../../../interfaces/common/customer.interface";
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomerService} from "../../../services/common/customer.service";
import {Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {NewSalesReturn} from "../../../interfaces/common/new-sales-return.interface";
import {Product} from "../../../interfaces/common/product.interface";
import {ProductService} from "../../../services/common/product.service";
import {NewSalesReturnService} from "../../../services/common/new-sales-return.service";


@Component({
  selector: 'app-new-sales-return',
  templateUrl: './new-sales-return.component.html',
  styleUrls: ['./new-sales-return.component.scss']
})
export class NewSalesReturnComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  newSalesReturn?: NewSalesReturn;
  customers: Customer[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private newSalesReturnService: NewSalesReturnService,
    private router: Router,

  ) { }


  ngOnInit(): void {
    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getNewSalesReturnById();
      }
      else {
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
      customer: [null, Validators.required],
      date: [null],
      referenceNo: [null],
      productName: [null],
      orderTax: [null],
      status: [null],
      discount: [null],
      shipping: [null],
      description: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.newSalesReturn);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.newSalesReturn) {
      this.updateNewSalesReturnById();
    }
    else {
      this.addNewSalesReturn();
    }

  }

  /**
   * HTTP REQ HANDLE
   * getNewSalesReturnById()
   * addNewSalesReturn()
   * updateNewSalesReturnById()
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
      sort: {name: 1}
    }

    this.subDataOne = this.customerService.getAllCustomers(filterData, null)
      .subscribe({
        next: (res) => {
          this.customers = res.data;
          if (this.id) {
            const customer = this.customers.find(f => f._id === this.newSalesReturn.customer._id);
            this.dataForm.patchValue({customer: customer._id});
          }
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  private addNewSalesReturn() {
    this.spinnerService.show();
    this.subDataTwo = this.newSalesReturnService.addNewSalesReturn(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/sales/', 'sales-return-list']);
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

  private getNewSalesReturnById() {
    this.spinnerService.show();
    this.subDataThree = this.newSalesReturnService.getNewSalesReturnById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.newSalesReturn = res.data;
            console.log(this.newSalesReturn)
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

  private updateNewSalesReturnById() {
    this.spinnerService.show();
    this.subDataFour = this.newSalesReturnService.updateNewSalesReturnById(this.newSalesReturn._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/sales/', 'sales-return-list']);
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
