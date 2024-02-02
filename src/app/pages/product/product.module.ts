import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddProductComponent } from './add-product/add-product.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ProductListComponent } from './product-list/product-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { SubCategoryListComponent } from './sub-category-list/sub-category-list.component';
import { AddSubCategoryComponent } from './add-sub-category/add-sub-category.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { AddBrandComponent } from './add-brand/add-brand.component';
import { ImportProductsComponent } from './import-products/import-products.component';
import { PrintBarcodeComponent } from './print-barcode/print-barcode.component';
import {DigitOnlyModule} from '@uiowa/digit-only';
import {NgxDropzoneModule} from 'ngx-dropzone';
import { AddUnitComponent } from './add-unit/add-unit.component';
import { UnitListComponent } from './unit-list/unit-list.component';
import {MaterialModule} from "../../material/material.module";
import {NgxPaginationModule} from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import {VendorSearchFieldModule} from '../../shared/lazy/vendor-search-field/vendor-search-field.module';
import {BarcodeGenerateComponent} from './product-list/barcode-generate/barcode-generate.component';
import {NgxPrintModule} from 'ngx-print';
import {NgxBarcode6Module} from 'ngx-barcode6';
import { NoContentModule } from 'src/app/shared/lazy/no-content/no-content.module';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';

@NgModule({
  declarations: [
    AddProductComponent,
    ProductListComponent,
    CategoryListComponent,
    AddCategoryComponent,
    SubCategoryListComponent,
    AddSubCategoryComponent,
    BrandListComponent,
    AddBrandComponent,
    ImportProductsComponent,
    PrintBarcodeComponent,
    AddUnitComponent,
    UnitListComponent,
    BarcodeGenerateComponent,
    PurchaseHistoryComponent,

  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    DigitOnlyModule,
    NgxDropzoneModule,
    MaterialModule,
    NgxPaginationModule,
    FormsModule,
    MaterialModule,
    NgxSpinnerModule,
    VendorSearchFieldModule,
    NgxPrintModule,
    NgxBarcode6Module,
    NoContentModule

  ]
})
export class ProductModule { }
