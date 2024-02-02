import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {SubCategory} from 'src/app/interfaces/common/sub-category.interface';
import {UiService} from '../../../services/core/ui.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SubCategoryService} from '../../../services/common/sub-category.service';
import {FilterData} from '../../../interfaces/gallery/filter-data';
import {CategoryService} from '../../../services/common/category.service';
import {Category} from '../../../interfaces/common/category.interface';


@Component({
  selector: 'app-add-sub-category',
  templateUrl: './add-sub-category.component.html',
  styleUrls: ['./add-sub-category.component.scss'],
})
export class AddSubCategoryComponent implements OnInit {
  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  subcategory?: SubCategory;
  categories?: Category[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subRouteOne: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private subcategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Init Data Form
    this.initDataForm();

    // GET ID FORM PARAM
    this.subRouteOne = this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');
      if (this.id) {
        this.getSubCategoryById();
      } else {
        this.getAllCategory();
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
      category: [null, Validators.required],
      name: [null, Validators.required],
      code: [null],
      description: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.subcategory);
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.subcategory) {
      this.updateSubCategoryById();
    } else {
      this.addSubCategory();
    }
  }

  /**
   * HTTP REQ HANDLE
   * getAllCategories()
   * addSubCategory()
   * getSubCategoryById()
   * updateSubCategoryById()
   */

  private addSubCategory() {
    this.spinnerService.show();
    this.subDataTwo = this.subcategoryService
      .addSubCategory(this.dataForm.value)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/product/', 'sub-category-list']);
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

  private getSubCategoryById() {
    this.spinnerService.show();
    this.subDataThree = this.subcategoryService
      .getSubCategoryById(this.id)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.data) {
            this.subcategory = res.data;
            console.log(this.subcategory);
            this.getAllCategory();
            this.setFormValue();
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          console.log(error);
        },
      });
  }

  private updateSubCategoryById() {
    this.spinnerService.show();
    this.subDataFour = this.subcategoryService
      .updateSubCategoryById(this.subcategory._id, this.dataForm.value)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/product/', 'sub-category-list']);
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
   * ON CATEGORY SELECT
   * getAllSubCategory()
   */

  private getAllCategory() {
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

    this.subDataOne = this.categoryService
      .getAllCategory(filterData, null)
      .subscribe({
        next: (res) => {
          this.categories = res.data;
          if (this.id) {
            const category = this.categories.find(
              (f) => f._id === this.subcategory.category._id
            );
            this.dataForm.patchValue({ category: category._id });
          }
        },
        error: (error) => {
          console.log(error);
        },
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

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }
  }
}
