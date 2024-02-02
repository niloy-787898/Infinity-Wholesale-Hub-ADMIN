import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-expense-category',
  templateUrl: './expense-category.component.html',
  styleUrls: ['./expense-category.component.scss']
})
export class ExpenseCategoryComponent implements OnInit {

  displayedColumns: string[] = ['id', 'date', 'categoryName', 'reference', 'status', 'amount', 'description', 'action'];
  dataSource = new MatTableDataSource<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
