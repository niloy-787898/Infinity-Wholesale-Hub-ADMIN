import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpenseRoutingModule } from './expense-routing.module';
import { ExpenseListComponent } from './expense-list/expense-list.component';


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
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseCategoryComponent } from './expense-category/expense-category.component';
import {NgxDropzoneModule} from "ngx-dropzone";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxPaginationModule} from "ngx-pagination";
import { MaterialModule } from 'src/app/material/material.module';
import {NoContentModule} from "../../shared/lazy/no-content/no-content.module";


@NgModule({
  declarations: [
    ExpenseListComponent,
    AddExpenseComponent,
    ExpenseCategoryComponent
  ],
    imports: [
        CommonModule,
        ExpenseRoutingModule,
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
        NgxDropzoneModule,
        MatCheckboxModule,
        MatPaginatorModule,
        FormsModule,
        NgxPaginationModule,
        MaterialModule,
        NoContentModule,
    ]
})
export class ExpenseModule { }
