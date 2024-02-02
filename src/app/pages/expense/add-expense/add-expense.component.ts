import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Expense } from 'src/app/interfaces/common/expense.interface';
import { UiService } from '../../../services/core/ui.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../../services/common/expense.service';
import { FileUploadService } from 'src/app/services/gallery/file-upload.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit {
  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  expense?: Expense;

  // Image Upload
  files: File[] = [];
  pickedImage: any[] = [];
  oldImage: string[] = [];
  subDataEight: any;
  subDataNine: any;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private expenseService: ExpenseService,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {}

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      date: [new Date(), Validators.required],
      expenseFor: [null],
      paidAmount: [null],
      dueAmount: [null],
      description: [null],
      images: [null],
    });

    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getExpenseById();
      }
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.expense);
    if (this.expense && this.expense.images && this.expense.images.length) {
      this.oldImage = this.expense.images;
    }
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      console.log(this.dataForm.errors);
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.expense) {
      if (this.files && this.files.length) {
        this.updateExpenseWithImage();
      } else {
        this.updateExpenseById();
      }
    } else {
      if (this.files && this.files.length) {
        this.addExpenseWithImage();
      } else {
        this.addExpense();
      }
    }
  }

  /**
   * HTTP REQ HANDLE
   * getExpenseById()
   * addExpense()
   * updateExpenseById()
   */

  private addExpense() {
    this.spinnerService.show();
    console.log(this.dataForm.value);
    console.log(this.dataForm.errors);
    this.subDataOne = this.expenseService
      .addExpense(this.dataForm.value)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/expense/', 'expense-list']);
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

  private getExpenseById() {
    this.spinnerService.show();
    // const select = 'name email username phoneNo gender role permissions hasAccess'
    this.subDataTwo = this.expenseService.getExpenseById(this.id).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.data) {
          this.expense = res.data;
          this.setFormValue();
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        console.log(error);
      },
    });
  }

  private updateExpenseById() {
    this.spinnerService.show();
    this.subDataThree = this.expenseService
      .updateExpenseById(this.expense._id, this.dataForm.value)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/expense/', 'expense-list']);
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
   * IMAGE UPLOAD
   * onSelect()
   * onRemove()
   * addProductWithImage()
   * updateProductWithImage()
   * removeSelectImage()
   */

  onSelect(event: { addedFiles: any }) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  private addExpenseWithImage() {
    this.subDataEight = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        this.dataForm.patchValue({ images: images });
        this.addExpense();
      });
  }

  private updateExpenseWithImage() {
    this.subDataNine = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        this.dataForm.patchValue({ images: [...this.oldImage, ...images] });
        this.updateExpenseById();
      });
  }

  removeSelectImage(index: number) {
    if (this.files && this.files.length) {
      this.files.splice(index - this.oldImage.length, 1);
      this.pickedImage.splice(index, 1);
    } else {
      this.oldImage.splice(index, 1);
      this.pickedImage.splice(index, 1);
    }
  }

  removeOldImage(index: number) {
    this.oldImage.splice(index, 1);
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
