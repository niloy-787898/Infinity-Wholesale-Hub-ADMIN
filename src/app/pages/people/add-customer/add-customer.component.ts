import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Customer } from 'src/app/interfaces/common/customer.interface';
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {CustomerService} from "../../../services/common/customer.service";



@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  customer?: Customer;


  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router,

  ) { }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;


  ngOnInit(): void {

    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM

    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getCustomerById();
      }
    });
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      address: [null],
      email: new FormControl('', [Validators.email]),
      phone: [null,Validators.required],
      // image: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.customer);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.customer) {
      this.updateCustomerById();
    }
    else {
      this.addCustomer();
    }

    console.log('VALUE',this.dataForm.value);
  }


  /**
   * HTTP REQ HANDLE
   * getCustomerById()
   * addCustomer()
   * updateCustomerById()
   */

  private addCustomer() {
    this.spinnerService.show();
    console.log(this.dataForm.value)
    this.subDataOne = this.customerService.addCustomer(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/people/', 'customer-list']);
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

  private getCustomerById() {
    this.spinnerService.show();
    this.subDataTwo = this.customerService.getCustomerById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.customer = res.data;
            console.log(this.customer)
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateCustomerById() {
    this.spinnerService.show();
    this.subDataThree = this.customerService.updateCustomerById(this.customer._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/people/', 'customer-list']);
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

  onCancel(){
    this.router.navigate(['/people/', 'customer-list']);
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
  }

}
