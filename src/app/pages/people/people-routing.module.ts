import { AddUserComponent } from './add-user/add-user.component';
import { UserListComponent } from './user-list/user-list.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { PeopleComponent } from './people.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerSalesReportComponent} from "./customer-sales-report/customer-sales-report.component";

const routes: Routes = [
  {path: '', component: PeopleComponent},
  {path: 'customer-list', component: CustomerListComponent},
  {path: 'add-customer', component: AddCustomerComponent},
  {path: 'customer-report/:id', component: CustomerSalesReportComponent},
  {path: 'edit-customer/:id', component: AddCustomerComponent},
  {path: 'supplier-list', component: SupplierListComponent},
  {path: 'edit-supplier/:id', component: AddSupplierComponent},
  {path: 'add-supplier', component: AddSupplierComponent},
  {path: 'user-list', component: UserListComponent},
  {path: 'add-user', component: AddUserComponent},
  {path: 'edit-user/:id', component: AddUserComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeopleRoutingModule { }
