import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeopleRoutingModule } from './people-routing.module';

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
import { CustomerListComponent } from './customer-list/customer-list.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add-user/add-user.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgxPaginationModule} from "ngx-pagination";
import { CustomerSalesReportComponent } from './customer-sales-report/customer-sales-report.component';
import {MaterialModule} from "../../material/material.module";
import {NoContentModule} from "../../shared/lazy/no-content/no-content.module";




@NgModule({
  declarations: [
    CustomerListComponent,
    AddCustomerComponent,
    SupplierListComponent,
    AddSupplierComponent,
    UserListComponent,
    AddUserComponent,
    CustomerSalesReportComponent,

  ],
  imports: [
    CommonModule,
    PeopleRoutingModule,
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
    FormsModule,
    MatCheckboxModule,
    NgxPaginationModule,
    MaterialModule,
    NoContentModule,
  ]
})
export class PeopleModule { }
