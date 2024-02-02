import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PagesRoutingModule} from './pages-routing.module';
import {PagesComponent} from './pages.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import { SalesComponent } from './sales/sales.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { ExpenseComponent } from './expense/expense.component';
import { PeopleComponent } from './people/people.component';
import {MatSelectModule} from '@angular/material/select';
import {NgxSpinnerModule} from "ngx-spinner";



@NgModule({
  declarations: [
    PagesComponent,
    SalesComponent,
    PurchaseComponent,
    ExpenseComponent,
    PeopleComponent,

  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    MatRadioModule,
    MatSelectModule,
    NgxSpinnerModule,
  ]
})
export class PagesModule {
}
