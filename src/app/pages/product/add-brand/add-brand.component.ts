import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Brand } from 'src/app/interfaces/common/brand.interface';
import { UiService } from 'src/app/services/core/ui.service';
import {BrandService} from "../../../services/common/brand.service";
import {NgxSpinnerService} from "ngx-spinner";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-add-brand',
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss']
})

export class AddBrandComponent implements OnInit, OnDestroy {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  brand?: Brand;

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subRouteOne: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private brandService: BrandService,
    private router: Router,

  ) { }


  ngOnInit(): void {

    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM

    this.subRouteOne = this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getBrandById();
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
      description: [null],
      img: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.brand);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.brand) {
      this.updateBrandById();
    }
    else {
      this.addBrand();
    }
  }

    /**
   * HTTP REQ HANDLE
   * getBrandById()
   * addBrand()
   * updateBrandById()
   */

    private addBrand() {
      this.spinnerService.show();
      this.subDataOne = this.brandService.addBrand(this.dataForm.value)
        .subscribe({
          next: (res => {
            this.spinnerService.hide();
            if (res.success) {
              this.uiService.success(res.message);
              this.formElement.resetForm();
              this.router.navigate(['/product/', 'brand-list']);
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

  private getBrandById() {
    this.spinnerService.show();
    this.subDataTwo = this.brandService.getBrandById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.brand = res.data;
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateBrandById() {
    this.spinnerService.show();
    this.subDataThree = this.brandService.updateBrandById(this.brand._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/product/', 'brand-list']);
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

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }
  }

}
