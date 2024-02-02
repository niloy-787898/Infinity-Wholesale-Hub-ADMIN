import { PurchaseComponent } from './purchase.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AddVendorComponent} from "./add-vendor/add-vendor.component";
import {VendorListComponent} from "./vendor-list/vendor-list.component";
import {AddVendorTransitionComponent} from "./add-vendor-transition/add-vendor-transition.component";
import {VendorTransactionListComponent} from "./vendor-transaction-list/vendor-transaction-list.component";
import { VendorExpenseListComponent } from './vendor-expense-list/vendor-expense-list.component';

const routes: Routes = [
  { path: '', component: PurchaseComponent },
  { path: 'add-vendor', component: AddVendorComponent },
  { path: 'edit-vendor/:id', component: AddVendorComponent },
  { path: 'vendor-list', component: VendorListComponent },
  // {path: 'purchase-list', component: PurchaseListComponent},
  // {path: 'edit-purchase/:id', component: AddPurchaseComponent},
  { path: 'vendor-transition/:id', component: AddVendorTransitionComponent },
  { path: 'vendor-transition-list', component: VendorTransactionListComponent },
  { path: 'vendor-expense-list/:id', component: VendorExpenseListComponent },
  // {path: 'import-purchase', component: ImportPurchaseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
