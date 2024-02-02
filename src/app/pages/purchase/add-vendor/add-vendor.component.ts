import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {Customer} from "../../../interfaces/common/customer.interface";
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomerService} from "../../../services/common/customer.service";
import {Subscription} from "rxjs";
import {Vendor} from "../../../interfaces/common/vendor.interface";
import {VendorService} from "../../../services/common/vendor.service";

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  vendor?: Vendor;


  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private vendorService: VendorService,
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
        this.getVendorById();
      }
    });
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      address: [null],
      email: new FormControl('', [Validators.email]),
      phone: [null,Validators.required],
      image: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.vendor);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.vendor) {
      this.updateVendorById();
    }
    else {
      this.addVendor();
    }

    console.log('VALUE',this.dataForm.value);
  }


  /**
   * HTTP REQ HANDLE
   * getCustomerById()
   * addCustomer()
   * updateCustomerById()
   */

  private addVendor() {
    this.spinnerService.show();
    console.log(this.dataForm.value)
    this.subDataOne = this.vendorService.addVendor(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/purchase/', 'vendor-list']);
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

  private getVendorById() {
    this.spinnerService.show();
    this.subDataTwo = this.vendorService.getVendorById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.vendor = res.data;
            console.log(this.vendor)
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateVendorById() {
    this.spinnerService.show();
    this.subDataThree = this.vendorService.updateVendorById(this.vendor._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/purchase/', 'vendor-list']);
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
