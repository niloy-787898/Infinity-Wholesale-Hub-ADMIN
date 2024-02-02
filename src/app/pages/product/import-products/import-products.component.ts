import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-import-products',
  templateUrl: './import-products.component.html',
  styleUrls: ['./import-products.component.scss']
})
export class ImportProductsComponent implements OnInit {
  productForm !: FormGroup;



  constructor() { }

  ngOnInit(): void {
  }



}
