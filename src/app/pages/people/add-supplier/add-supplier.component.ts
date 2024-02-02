import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Supplier } from 'src/app/interfaces/common/supplier.interface';
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {SupplierService} from "../../../services/common/supplier.service";




@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss']
})
export class AddSupplierComponent implements OnInit {


  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  supplier?: Supplier;


  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private supplierService: SupplierService,
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
        this.getSupplierById();
      }
    });
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      email: [null],
      phone: [null],
      country: [null],
      city: [null],
      address: [null],
      description: [null],
      img: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.supplier);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.supplier) {
      this.updateSupplierById();
    }
    else {
      this.addSupplier();
    }

    console.log('VALUE',this.dataForm.value);
  }


  /**
   * HTTP REQ HANDLE
   * getSupplierById()
   * addSupplier()
   * updateSupplierById()
   */

  private addSupplier() {
    this.spinnerService.show();
    this.subDataOne = this.supplierService.addSupplier(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/people/', 'supplier-list']);
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

  private getSupplierById() {
    this.spinnerService.show();
    this.subDataTwo = this.supplierService.getSupplierById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.supplier = res.data;
            console.log(this.supplier)
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateSupplierById() {
    this.spinnerService.show();
    this.subDataThree = this.supplierService.updateSupplierById(this.supplier._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/people/', 'supplier-list']);
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
  }

}
