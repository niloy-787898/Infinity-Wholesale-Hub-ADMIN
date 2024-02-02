import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { UiService } from "../../../services/core/ui.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { FileUploadService } from 'src/app/services/gallery/file-upload.service';
import { Transactions } from 'src/app/interfaces/common/transaction.interface';
import { TransactionsService } from 'src/app/services/common/transactions.service';



@Component({
  selector: 'app-add-vendor-transition',
  templateUrl: './add-vendor-transition.component.html',
  styleUrls: ['./add-vendor-transition.component.scss']
})

export class AddVendorTransitionComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  transactions?: Transactions;
  transactionDate: Date = new Date();
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
    private transactionsService: TransactionsService,
    private router: Router,
    private fileUploadService: FileUploadService,

  ) { }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;



  ngOnInit(): void {
    this.dataForm = this.fb.group({
      transactionDate: [new Date(), Validators.required],
      paidAmount: [null],
      dueAmount: [null],
      description: [null],
      images: [null],
    });

    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getTransactionsById();
      }
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.transactions);
    if (this.transactions && this.transactions.images && this.transactions.images.length) {
      this.oldImage = this.transactions.images;
    }
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.transactions) {
      if (this.files && this.files.length) {
        this.updateTransactionsWithImage()
      } else {
        this.updateTransactionsById();
      }
    } else {
      if (this.files && this.files.length) {
        this.addTransactionsWithImage()
      } else {
        this.addTransactions();
      }
    }
  }

  /**
   * HTTP REQ HANDLE
   * getTransactionsById()
   * addTransactions()
   * updateTransactionsById()
   */


  private addTransactions() {
    this.spinnerService.show();
    console.log(this.dataForm.value)
    const mData = {
      ...this.dataForm.value,
      vendorId: this.id
    }
    console.log(this.dataForm.errors)
    this.subDataOne = this.transactionsService.addTransactions(mData)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/purchase/', 'vendor-transition-list']);
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

  private getTransactionsById() {
    this.spinnerService.show();
    this.subDataTwo = this.transactionsService.getTransactionsById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.transactions = res.data;
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateTransactionsById() {
    this.spinnerService.show();
    this.subDataThree = this.transactionsService.updateTransactionsById(this.transactions._id, this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/purchase/', 'vendor-transition-list']);
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
   * IMAGE UPLOAD
   * onSelect()
   * onRemove()
   * addProductWithImage()
   * updateProductWithImage()
   * removeSelectImage()
   */

  onSelect(event: { addedFiles: any; }) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  private addTransactionsWithImage() {
    this.subDataEight = this.fileUploadService.uploadMultiImageOriginal(this.files).subscribe((res) => {
      const images = res.map(m => m.url);
      this.dataForm.patchValue({ images: images });
      this.addTransactions();
    })
  }

  private updateTransactionsWithImage() {
    this.subDataNine = this.fileUploadService.uploadMultiImageOriginal(this.files).subscribe((res) => {
      const images = res.map(m => m.url);
      this.dataForm.patchValue({ images: [...this.oldImage, ...images] });
      this.updateTransactionsById();
    })
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
    this.oldImage.splice(index, 1)
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
