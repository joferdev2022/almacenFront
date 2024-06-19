import { Component, OnInit, ViewChild } from '@angular/core';

import {MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { DataService } from 'src/app/services/data.service';
import { ProductModel } from 'src/app/models/internal/product.model';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit{
  displayedColumns: string[] = ['name', 'description', 'category', 'measure', 'priceBuy', 'priceSale', 'stock'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?:number;
  products!:Array<ProductModel>;
  productsTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService,
              private paginatorIntl: MatPaginatorIntl) {
      
       paginatorIntl.itemsPerPageLabel = 'items por página'; 

    
  }
  ngOnInit(): void {
    this.loadAllProducts();
    
  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }


  loadAllProducts() {
    this.dataService.loadProducts(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        console.log(res);
        
        this.products = res.data;
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalProducts = res.total;
        this.itemsPerPage = res.xpage;
        this.currentPage = res.page! ;
        // console.log(res);
      },
      error: (e) => {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
        console.log(e);
      }
    })

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
