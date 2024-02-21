import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import { SalesListComponent } from './sales-list/sales-list.component';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesReturnListComponent } from './sales-return-list/sales-return-list.component';
import { NewSalesReturnComponent } from './new-sales-return/new-sales-return.component';
import { NewSalesComponent } from './new-sales/new-sales.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SharedModule} from '../../shared/shared.module';
import { CustomerSearchFieldComponent } from './customer-search-field/customer-search-field.component';
import { ProductSearchFiledComponent } from './product-search-filed/product-search-filed.component';
import { ReturnSalesComponent } from './return-sales/return-sales.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PreOrderAddComponent } from './pre-order-add/pre-order-add.component';
import { PreOrderListComponent } from './pre-order-list/pre-order-list.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MySalesReportComponent} from "./my-sales-report/my-sales-report.component";
import { MaterialModule } from 'src/app/material/material.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import {NoContentModule} from "../../shared/lazy/no-content/no-content.module";
import { SalesListMonthComponent } from './sales-list-month/sales-list-month.component';
import { SalesInvoicePrintByIdComponent } from './sales-invoice-print-by-id/sales-invoice-print-by-id.component';





@NgModule({
  declarations: [
    SalesListComponent,
    SalesReturnListComponent,
    NewSalesReturnComponent,
    NewSalesComponent,
    CustomerSearchFieldComponent,
    ProductSearchFiledComponent,
    ReturnSalesComponent,
    PreOrderAddComponent,
    PreOrderListComponent,
    MySalesReportComponent,
    SalesListMonthComponent,
    SalesInvoicePrintByIdComponent
  ],
    imports: [
        CommonModule,
        SalesRoutingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatRadioModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        FormsModule,
        SharedModule,
        NgxPaginationModule,
        MatTooltipModule,
        NgxSpinnerModule,
        MaterialModule,
        NoContentModule,
    ],
  // schemas: [
  //   CUSTOM_ELEMENTS_SCHEMA
  // ],

})
export class SalesModule { }
