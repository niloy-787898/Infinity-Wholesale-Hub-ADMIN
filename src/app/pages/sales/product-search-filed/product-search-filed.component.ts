import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, EMPTY, pluck, Subscription, switchMap } from 'rxjs';
import { Product } from 'src/app/interfaces/common/product.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { ProductService } from 'src/app/services/common/product.service';

@Component({
  selector: 'app-product-search-filed',
  templateUrl: './product-search-filed.component.html',
  styleUrls: ['./product-search-filed.component.scss']
})
export class ProductSearchFiledComponent implements OnInit,AfterViewInit {

  @Output() onSelect = new EventEmitter<Product>();

   // SEARCH AREA
   overlay = false;
   isOpen = false;
   isFocused = false;
   isLoading = false;
   isSelect = false;
   searchProducts: Product[] = [];
   products: Product[] = [];
   searchQuery = null;
   totalProducts: number = 0;
   @ViewChild('searchForm') searchForm: NgForm;
   @ViewChild('searchInput') searchInput: ElementRef;


  // Subscriptions
  private subForm: Subscription;


  constructor(
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    console.log('askjhd')
    const formValue = this.searchForm.valueChanges;

    this.subForm = formValue.pipe(
      // map(t => t.searchTerm)
      // filter(() => this.searchForm.valid),
      pluck('searchTerm'),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(data => {
        this.searchQuery = data;
        console.log('this.searchQuery ', this.searchQuery )
        if (this.searchQuery === '' || this.searchQuery === null) {
          this.overlay = false;
          this.searchProducts = [];
          this.totalProducts = 0;
          this.searchQuery = null;
          return EMPTY;
        }

        // Select
        const mSelect = {
          name: 1,
          images: 1,
          code:1,
          sku: 1,
          category: 1,
          brand: 1,
          price: 1,
          unit: 1,
          quantity: 1,
          purchasePrice: 1,
          salePrice: 1,
          model:1,
          others:1,
        }

        const filterData: FilterData = {
          pagination: null,
          filter: null,
          select: mSelect,
          sort: {createdAt: -1}
        }

        return this.productService.getAllProducts(filterData, this.searchQuery);
      })
    )
      .subscribe({
        next: res => {
          this.searchProducts = res.data;
          console.log('this is response,customer', this.searchProducts)

          this.products = this.searchProducts;
          this.totalProducts = res.count;
          if (this.searchProducts.length > 0) {
            this.isOpen = true;
            this.overlay = true;
          }

          console.log('totalCustomers', this.totalProducts);
        },
        error: error => {
          console.log(error)
        }
      })
  }


  /**
   * HANDLE SEARCH Area
   * onClickHeader()
   * onClickSearchArea()
   * handleOverlay()
   * handleFocus()
   * setPanelState()
   * handleOpen()
   * handleOutsideClick()
   * handleCloseOnly()
   * handleCloseAndClear()
   * onSelectItem()
   */


  onClickHeader(): void {
    this.handleCloseOnly();
  }

  onClickSearchArea(event: MouseEvent): void {
    event.stopPropagation();
  }

  handleOverlay(): void {
    this.overlay = false;
    this.isOpen = false;
    this.isFocused = false;
  }

  handleFocus(event: FocusEvent): void {
    this.searchInput.nativeElement.focus();

    if (this.isFocused) {
      return;
    }
    if (this.searchProducts.length > 0) {
      this.setPanelState(event);
    }
    this.isFocused = true;
  }

  private setPanelState(event: FocusEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = false;
    this.handleOpen();
  }

  handleOpen(): void {
    if (this.isOpen || this.isOpen && !this.isLoading) {
      return;
    }
    if (this.searchProducts.length > 0) {
      this.isOpen = true;
      this.overlay = true;
    }
  }

  handleOutsideClick(): void {
    if (!this.isOpen) {
      // this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.isFocused = false;
  }

  handleCloseOnly(): void {
    if (!this.isOpen) {
      this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.isFocused = false;
  }

  handleCloseAndClear(): void {
    if (!this.isOpen) {
      this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.searchProducts = [];
    this.isFocused = false;
  }

  onSelectItem(data: Product): void {
    this.handleCloseAndClear();
    this.searchForm.resetForm();
    this.onSelect.emit(data);
  }
}
