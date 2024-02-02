import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-print-barcode',
  templateUrl: './print-barcode.component.html',
  styleUrls: ['./print-barcode.component.scss']
})
export class PrintBarcodeComponent implements OnInit {
    // Data Form
    @ViewChild('formElement') formElement: NgForm;
    dataForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      productName: [null, Validators.required],
    });
  }

  onSubmit() {
    console.log(this.dataForm.value)

  }

}
