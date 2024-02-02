import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../../services/common/category.service";
import {Subscription} from "rxjs";
import {Category} from "../../../interfaces/common/category.interface";


@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit, OnDestroy {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  category?: Category;

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
    private spinner: NgxSpinnerService,
    private categoryService: CategoryService,
    private router: Router,

  ) { }


  ngOnInit(): void {

    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM
    this.subRouteOne = this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getCategoryById();
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
      code: [null],
      description: [null],
      img: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.category);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.category) {
      this.updateCategoryById();
    }
    else {
      this.spinner.show();
      this.addCategory();
    }

  }


  /**
   * HTTP REQ HANDLE
   * getCategoryById()
   * addCategory()
   * updateCategoryById()
   */

  private addCategory() {
    // Spinner..
    this.spinner.show();
    this.subDataOne = this.categoryService.addCategory(this.dataForm.value)
      .subscribe({
        next: (res => {
          // Spinner..
          this.spinner.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/product/', 'category-list']);
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

  private getCategoryById() {
    this.spinnerService.show();
    this.subDataTwo = this.categoryService.getCategoryById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.category = res.data;
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateCategoryById() {
    // Spinner..
    this.spinner.show();
    this.subDataThree = this.categoryService.updateCategoryById(this.category._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          // Spinner..
          this.spinner.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/product/', 'category-list']);
          } else {
            this.uiService.warn(res.message);
          }

        }),
        error: (error => {
          this.spinner.hide();
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
