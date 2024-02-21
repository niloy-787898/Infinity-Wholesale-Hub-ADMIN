import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Customer } from 'src/app/interfaces/common/customer.interface';
import { NewSales } from 'src/app/interfaces/common/new-sales.interface';
import { Product } from 'src/app/interfaces/common/product.interface';
import { NewSalesService } from 'src/app/services/common/new-sales.service';

@Component({
  selector: 'app-sales-invoice-print-by-id',
  templateUrl: './sales-invoice-print-by-id.component.html',
  styleUrls: ['./sales-invoice-print-by-id.component.scss'],
})
export class SalesInvoicePrintByIdComponent implements OnInit {
  // Subscriptions
  private subDataOne: Subscription;

  // Store Data
  id?: string;
  newSales?: NewSales;
  customers?: Customer[] = [];
  customer: Customer;
  customerInfo = false;
  search = false;
  discount: number = 0;
  discountPercent: number = 0;
  shippingCharge: number = 0;
  subTotal: number = 0;
  total: number = 0;
  soldDate: Date = new Date();

  //Store Components Data
  products: Product[] = [];

  constructor(
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private newSalesService: NewSalesService
  ) {}

  ngOnInit() {
    // GET ID FORM PARAM
    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getNewSalesById();
      }
    });
  }
  private getNewSalesById() {
    this.spinnerService.show();
    this.subDataOne = this.newSalesService.getNewSalesById(this.id).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        if (res.data) {
          this.newSales = res.data;
          this.soldDate = new Date(this.newSales.soldDate);
          this.products = this.newSales.products;
          this.subTotal = this.newSales.subTotal;
          this.total = this.newSales.total;
          this.discount = this.newSales.discountAmount;
          this.discountPercent = this.newSales.discountPercent;
          this.shippingCharge = this.newSales.shippingCharge;
          console.log(this.newSales);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        console.log(error);
      },
    });
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
          <title>Infinity Wholesale Hub</title>

          <style>
          .top {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            margin-bottom: 20px;
          }
          .top .image-logo img {
            display: block;
            height: 30px;
            margin-bottom:20px;
          }
          .top .image-logo p {
            font-size: 14px;
          }
          .top .image-logo p span{
            font-weight: bold;
          }

          .top .text-Invoice h2 {
            font-family: Arial, sans-serif;
            font-weight: 600;
            color: #212b36;
            font-size: 22px;
            line-height: 0.5;
          }
          .top .text-Invoice p {
            font-family: "Nunito", sans-serif;
            font-size: 16px;
            color: #555;
            font-weight: 400;
            margin-bottom: 0;
          }
          .main{
            margin-top:200px;
            padding:100px 20px;
          }
          .main .customer-info {
            font-family: Arial, sans-serif;
            margin-bottom: 30px;
          }
          .product-img img{
              width: 40px !important;
              margin: 0 auto;
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
            border: 1px solid #F8F8F8 !important;
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
            border: 1px solid #F8F8F8 !important;
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
  }
}
