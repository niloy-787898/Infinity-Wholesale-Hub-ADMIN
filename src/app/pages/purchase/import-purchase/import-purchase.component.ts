import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-import-purchase',
  templateUrl: './import-purchase.component.html',
  styleUrls: ['./import-purchase.component.scss']
})
export class ImportPurchaseComponent implements OnInit {



  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      supplierName: [null, Validators.required],
      purchase: [],
      orderTax: [null],
      discount: [null],
      shipping: [null],
      description: [null],

    });
  }

  onSubmit() {
    console.log(this.dataForm.value)
  }

}
