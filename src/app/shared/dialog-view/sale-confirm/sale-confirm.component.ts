import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-note-view',
  templateUrl: './sale-confirm.component.html',
  styleUrls: ['./sale-confirm.component.scss'],
})
export class SaleConfirmComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SaleConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  /**
   * ON CLOSE DIALOG
   */
  onClose(type?: string) {
    console.log('type', type);
    this.dialogRef.close({ type: type });
  }

  printSection(divId: string) {
    let printContents = document.getElementById(divId).innerHTML;
    console.log('print content', printContents);
    let popupWin = window.open(
      '',
      '_blank',
      'top=0,left=0,height=100%,width=auto'
    );
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print</title>

          <style>
          .main{
            margin-top:200px;
          }
          .main .customer-info {
            font-family: Arial, sans-serif;
          }

          .main .customer-info h5 {
            font-size: 14px;
          }

          .main .customer-info .line {
            margin-top: -6px;
            margin-bottom: 6px;
          }

          .main .customer-info p {
            font-size: 14px;
          }

          .main .customer-info p span {
            font-weight: bold;
          }

          .table .total-order {
            max-width: 430px;
            width: 200px;
            margin: 30px 30px 30px auto;
          }

          .table .total-order td {
            font-family: "Nunito", sans-serif;
            width: 72%;
            color: #637381;
            font-size: 14px;
            font-weight: 600;
            padding: 10px;
            border-right: 1px solid #F8F8F8;
            background: #FAFBFE;
          }

          .table .total-order .number-color {
            color: #212B36;
            font-size: 14px;
            font-weight: 700;
            text-align: right;
          }

          .table .total-order .total {
            color: #5E5873;
            font-weight: 600;
          }
          .container {
            display: block;
            max-width: 1900px;
            width: 96%;
            margin: auto;
          }

          th {
            font-family: 'Nunito Sans', sans-serif;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            padding: 10px;
            white-space: nowrap;
          }

          .table-row {
            background-color: #151515;
            color: #fff !important;
          }

          .table-hover:hover {
            background-color: #f5f5f5;
          }

          td {
            font-family: 'Nunito Sans', sans-serif;
            padding: 10px;
            color: #637381;
            font-weight: 400;
            border-bottom: 1px solid #e9ecef;
            vertical-align: middle;
            white-space: nowrap;
            text-align: center;
            margin-bottom: 15px;
          }

          .mat-elevation-z8 {
            margin: 0 0 25px;
            border: 1px solid #e8ebed;
            border-radius: 6px;
          }

          table {
            width: 100%;
            background: #fafbfe;
            border-bottom: 1px solid #e9ecef;
            border-collapse: collapse;
          }

          .table-responsive {
            overflow-x: auto !important;
          }

          .mat-form-field {
            font-size: 14px;
            width: 100%;
          }


          </style>
        </head>
        <body onload="window.print();setTimeout(window.close, 0)">${printContents}</body>
      </html>`);
    popupWin.document.close();

    // Assuming the action as confirmed after printing
    this.onClose('confirm');
  }
}
