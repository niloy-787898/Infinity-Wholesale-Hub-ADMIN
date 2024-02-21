import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Product } from 'src/app/interfaces/common/product.interface';
import { UiService } from '../../../services/core/ui.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../services/common/product.service';
import { Select } from '../../../interfaces/core/select';
import { DATA_BOOLEAN } from '../../../core/utils/app-data';
import { FileUploadService } from '../../../services/gallery/file-upload.service';
import { Unit } from '../../../interfaces/common/unit.interface';
import { Vendor } from '../../../interfaces/common/vendor.interface';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  // Static Data
  dataBoolean: Select[] = DATA_BOOLEAN;

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  product?: Product;
  units: Unit[] = [];
  vendor: Vendor = null;

  // Image Upload
  files: File[] = [];
  pickedImage: any[] = [];
  oldImage: string[] = [];

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subDataFive: Subscription;
  private subDataSix: Subscription;
  private subDataSeven: Subscription;
  private subDataEight: Subscription;
  private subDataNine: Subscription;
  private subRouteOne: Subscription;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    // Init Data Form
    this.initDataForm();

    // GET ID FORM PARAM
    this.subRouteOne = this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getProductById();
      } else {
        this.spinner.hide();
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
      name: [null],
      sku: [null],
      quantity: [null],
      newQuantity: [null],
      purchasePrice: [null],
      salePrice: [null],
      soldQuantity: [null],
      status: [this.dataBoolean[0].value],
      description: [null],
      images: [null],
    });
  }

  private setFormValue() {
    console.log(this.product);
    this.dataForm.patchValue(this.product);

    if (this.product && this.product.images && this.product.images.length) {
      this.oldImage = this.product.images;
    }
  }

  onSubmit() {
    // this.spinner.show();
    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }

    // Modify Form data
    let mData = { ...this.dataForm.value };

    if (this.dataForm.value.newQuantity) {
      mData = {
        ...mData,
        ...{
          quantity:
            this.dataForm.value.quantity + this.dataForm.value.newQuantity,
        },
      };
    }

    if (this.product) {
      if (this.files && this.files.length) {
        this.updateProductWithImage(mData);
      } else {
        this.updateProductById(mData);
      }
    } else {
      if (this.files && this.files.length) {
        this.addProductWithImage(mData);
      } else {
        this.addProduct(mData);
        // this.spinner.hide();
      }
    }
  }

  /**
   * HTTP REQ HANDLE
   * getProductById()
   * addProduct()
   * updateProductById()
   */

  /* Base Data */

  private addProduct(data: any) {
    this.subDataFive = this.productService.addProduct(data).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.success) {
          this.uiService.success(res.message);
          this.formElement.resetForm();
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

  private getProductById() {
    this.spinnerService.show();
    this.subDataSix = this.productService.getProductById(this.id).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.data) {
          this.product = res.data;
          this.setFormValue();
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        console.log(error);
      },
    });
  }

  private updateProductById(data: any) {
    this.spinnerService.show();

    this.subDataSeven = this.productService
      .updateProductById(this.product._id, data)
      .subscribe({
        next: (res) => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/product/', 'product-list']);
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

  private addProductWithImage(data: any) {
    this.subDataEight = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        const mData = {
          ...data,
          ...{ images: images },
        };
        this.addProduct(mData);
      });
  }

  private updateProductWithImage(data: any) {
    this.subDataNine = this.fileUploadService
      .uploadMultiImageOriginal(this.files)
      .subscribe((res) => {
        const images = res.map((m) => m.url);
        const mData = {
          ...data,
          ...{ images: images },
        };
        this.updateProductById(mData);
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

    if (this.subDataFour) {
      this.subDataFour.unsubscribe();
    }

    if (this.subDataFive) {
      this.subDataFive.unsubscribe();
    }

    if (this.subDataSix) {
      this.subDataSix.unsubscribe();
    }

    if (this.subDataSeven) {
      this.subDataSeven.unsubscribe();
    }

    if (this.subDataNine) {
      this.subDataEight.unsubscribe();
    }

    if (this.subRouteOne) {
      this.subRouteOne.unsubscribe();
    }
  }
}
