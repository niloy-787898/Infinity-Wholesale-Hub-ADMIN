import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AddPurchaseComponent } from './add-purchase/add-purchase.component';
import { ImportPurchaseComponent } from './import-purchase/import-purchase.component';
import { AddVendorComponent } from './add-vendor/add-vendor.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import {NgxPaginationModule} from "ngx-pagination";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AddVendorTransitionComponent } from './add-vendor-transition/add-vendor-transition.component';
import { VendorTransactionListComponent } from './vendor-transaction-list/vendor-transaction-list.component';
import {NgxSpinnerModule} from "ngx-spinner";
import {NoContentModule} from "../../shared/lazy/no-content/no-content.module";
import { MatTooltipModule } from '@angular/material/tooltip';
import { VendorExpenseListComponent } from './vendor-expense-list/vendor-expense-list.component';


@NgModule({
  declarations: [
    PurchaseListComponent,
    AddPurchaseComponent,
    ImportPurchaseComponent,
    AddVendorComponent,
    VendorListComponent,
    AddVendorTransitionComponent,
    VendorTransactionListComponent,
    VendorExpenseListComponent
  ],
    imports: [
        CommonModule,
        PurchaseRoutingModule,
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
        NgxPaginationModule,
        FormsModule,
        MatCheckboxModule,
        NgxDropzoneModule,
        NgxSpinnerModule,
        NoContentModule,
        MatTooltipModule,
    ]
})
export class PurchaseModule { }
