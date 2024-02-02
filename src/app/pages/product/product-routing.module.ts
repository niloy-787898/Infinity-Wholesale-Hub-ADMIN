import {ImportProductsComponent} from './import-products/import-products.component';
import {AddBrandComponent} from './add-brand/add-brand.component';
import {BrandListComponent} from './brand-list/brand-list.component';
import {AddSubCategoryComponent} from './add-sub-category/add-sub-category.component';
import {SubCategoryListComponent} from './sub-category-list/sub-category-list.component';
import {AddCategoryComponent} from './add-category/add-category.component';
import {CategoryListComponent} from './category-list/category-list.component';
import {AddProductComponent} from './add-product/add-product.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductListComponent} from './product-list/product-list.component';
import {AddUnitComponent} from './add-unit/add-unit.component';
import {UnitListComponent} from './unit-list/unit-list.component';
import {BarcodeGenerateComponent} from './product-list/barcode-generate/barcode-generate.component';
import {PurchaseHistoryComponent} from "./purchase-history/purchase-history.component";

const routes: Routes = [
  {path: '', redirectTo: 'product-list', pathMatch: 'full'},
  {path: 'add-product', component: AddProductComponent},
  {path: 'edit-product/:id', component: AddProductComponent},
  {path: 'product-list', component: ProductListComponent},
  {path: 'category-list', component: CategoryListComponent},
  {path: 'add-category', component: AddCategoryComponent},
  {path: 'edit-category/:id', component: AddCategoryComponent},
  {path: 'sub-category-list', component: SubCategoryListComponent},
  {path: 'add-sub-category', component: AddSubCategoryComponent},
  {path: 'edit-sub-category/:id', component: AddSubCategoryComponent},
  {path: 'brand-list', component: BrandListComponent},
  {path: 'add-brand', component: AddBrandComponent},
  {path: 'edit-brand/:id', component: AddBrandComponent},
  {path: 'unit-list', component: UnitListComponent},
  {path: 'add-unit', component: AddUnitComponent},
  {path: 'purchase-history', component: PurchaseHistoryComponent},
  {path: 'edit-unit/:id', component: AddUnitComponent},
  {path: 'import-products', component: ImportProductsComponent},
  {path: 'barcode-generate/:id', component: BarcodeGenerateComponent},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule {
}
