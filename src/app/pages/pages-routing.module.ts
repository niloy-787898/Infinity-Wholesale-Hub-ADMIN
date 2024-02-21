import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AdminAuthStateGuard } from '../auth-guard/admin-auth-state.guard';
import { CheckAuthAccessGuard } from '../auth-guard/check-auth-access.guard';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [CheckAuthAccessGuard]
      },
      {
        path: 'projects',
        loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'product',
        loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
      },
      {
        path: 'sales',
        loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule),
      },
      {
        path: 'purchase',
        loadChildren: () => import('./purchase/purchase.module').then(m => m.PurchaseModule),
      },
      {
        path: 'expense',
        loadChildren: () => import('./expense/expense.module').then(m => m.ExpenseModule),
      },
      {
        path: 'people',
        loadChildren: () => import('./people/people.module').then(m => m.PeopleModule),
      },
      {
        path: 'admin-control',
        loadChildren: () => import('./admin-control/admin-control.module').then(m => m.AdminControlModule),
        canActivate: [CheckAuthAccessGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PagesRoutingModule {
}
