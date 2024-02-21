import { NewSalesComponent } from './new-sales/new-sales.component';
import { NewSalesReturnComponent } from './new-sales-return/new-sales-return.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesComponent } from './sales.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReturnSalesComponent } from './return-sales/return-sales.component';
import {PreOrderAddComponent} from "./pre-order-add/pre-order-add.component";
import {PreOrderListComponent} from "./pre-order-list/pre-order-list.component";
import {MySalesReportComponent} from "./my-sales-report/my-sales-report.component";
import { SalesListMonthComponent } from './sales-list-month/sales-list-month.component';
import { SalesInvoicePrintByIdComponent } from './sales-invoice-print-by-id/sales-invoice-print-by-id.component';

const routes: Routes = [
  {path: '', component: SalesComponent},
  // {path: 'sales-list', component: SalesListComponent},
  {path: 'sales-list', component: SalesListMonthComponent},
  {path: 'my-sales-list', component: MySalesReportComponent},
  {path: 'sales-return/:id', component: ReturnSalesComponent},
  {path: 'new-sales-return', component: NewSalesReturnComponent},
  {path: 'edit-sales-return/:id', component: NewSalesReturnComponent},
  {path: 'new-sales', component: NewSalesComponent},
  {path: 'new-sales/:id', component: NewSalesComponent},
  {path: 'new-sales-view/:id', component: SalesInvoicePrintByIdComponent},
  {path: 'return-sales', component: ReturnSalesComponent},
  {path: 'pre-order', component: PreOrderAddComponent},
  {path: 'pre-order/:id', component: PreOrderAddComponent},
  {path: 'pre-order-list', component: PreOrderListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
