import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {Supplier} from "../../../interfaces/common/supplier.interface";
import {SupplierService} from "../../../services/common/supplier.service";
import {PurchaseService} from "../../../services/common/purchase.service";
import {Product} from "../../../interfaces/common/product.interface";
import {ProductService} from "../../../services/common/product.service";
import {ProductPurchase} from "../../../interfaces/common/product-purchase.interface";


@Component({
  selector: 'app-add-purchase',
  templateUrl: './add-purchase.component.html',
  styleUrls: ['./add-purchase.component.scss']
})
export class AddPurchaseComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  purchase?: ProductPurchase;
  suppliers: Supplier[] = [];
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private supplierService: SupplierService,
    private productService: ProductService,
    private purchaseService: PurchaseService,
    private router: Router,

  ) { }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subDataFive: Subscription;
  private subRouteOne: Subscription;


  ngOnInit(): void {
    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM

    this.subRouteOne = this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getPurchaseById();
      }
      else {
        this.getAllSuppliers();
        this.getAllProducts();
      }
    });
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      supplier: [null, Validators.required],
      date: [null],
      referenceNo: [null],
      product: [null],
      productName: [null],
      orderTax: [null],
      discount: [null],
      status: [null],
      shipping: [null],
      description: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.purchase);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.purchase) {
      this.updatePurchaseById();
    }
    else {
      this.addPurchase();
    }
  }

  /**
   * HTTP REQ HANDLE
   * getPurchaseById()
   * addPurchase()
   * updatePurchaseById()
   */

  private getAllSuppliers() {

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


    this.subDataOne= this.supplierService.getAllSuppliers(filterData, null)
      .subscribe({
        next: (res) => {
          this.suppliers = res.data;
          if (this.id) {
            // const supplier = this.suppliers.find(f => f._id === this.purchase.supplier._id);
            // this.dataForm.patchValue({supplier: supplier._id});
          }
        },
        error: (error) => {
          console.log(error);
        }
      })

  }

  private getAllProducts() {

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

    this.subDataTwo = this.productService.getAllProducts(filterData, null)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          if (this.id) {
            const product = this.products.find(f => f._id === this.purchase.product._id);
            this.dataForm.patchValue({product: product._id});
          }
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  private addPurchase() {
    this.spinnerService.show();
    this.subDataThree = this.purchaseService.addPurchase(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/purchase/', 'purchase-list']);
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

  private getPurchaseById() {
    this.spinnerService.show();
    this.subDataFour = this.purchaseService.getPurchaseById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.purchase = res.data;
            console.log(this.purchase)
            this.getAllSuppliers();
            this.getAllProducts();
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updatePurchaseById() {
    // this.spinnerService.show();
    // this.subDataFive = this.purchaseService.updatePurchaseById(this.purchase._id,this.dataForm.value)
    //   .subscribe({
    //     next: (res => {
    //       this.spinnerService.hide();
    //       if (res.success) {
    //         this.uiService.success(res.message);
    //         this.router.navigate(['/purchase/', 'purchase-list']);
    //       } else {
    //         this.uiService.warn(res.message);
    //       }
    //
    //     }),
    //     error: (error => {
    //       this.spinnerService.hide();
    //       console.log(error);
    //     })
    //   });
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
  }

}
