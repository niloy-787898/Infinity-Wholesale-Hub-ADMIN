import { ExpenseCategoryComponent } from './expense-category/expense-category.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseComponent } from './expense.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', component: ExpenseComponent},
  {path: 'expense-list', component: ExpenseListComponent},
  {path: 'add-expense', component: AddExpenseComponent},
  {path: 'edit-expense/:id', component: AddExpenseComponent},
  {path: 'expense-category', component: ExpenseCategoryComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }
