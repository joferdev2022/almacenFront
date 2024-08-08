import { Component, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DataService } from 'src/app/services/data.service';
import { ProductModel } from 'src/app/models/internal/product.model';
import { ModalProductComponentComponent } from 'src/app/components/modal-product.component/modal-product.component.component';
import { ModalChoiceComponentComponent } from 'src/app/components/modal-choice.component/modal-choice.component.component';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit{
  displayedColumns: string[] = ['name', 'description', 'category', 'measure', 'priceBuy', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?:number;
  products!:Array<ProductModel>;
  productsTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService,
              private paginatorIntl: MatPaginatorIntl,
              public dialog: MatDialog) {
      
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
  openDialogCreate() {
    const dialogRef = this.dialog.open(ModalProductComponentComponent, {
      data: {customer: '', operation: "create"}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if( result== true) {

        timer(1000).subscribe(() => {

          this.loadAllProducts();
        });
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogUpdate(product: any) {
    console.log(product);
    
    const dialogRef = this.dialog.open(ModalProductComponentComponent, {
      data: {product: product, operation: "update"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if( result== true) {

        timer(1000).subscribe(() => {

          this.loadAllProducts();
        });
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  deleteProduct(productId: any) {
    console.log(productId);
    
    this.dataService.deleteProductById(productId).subscribe({
      next: (res) => {
        timer(1000).subscribe(() => {

          this.loadAllProducts();
        });
      }
    })
  }

  openDeleteModal(productId:any) {
    const dialogRef = this.dialog.open(ModalChoiceComponentComponent, {
      data: {title: 'Eliminar Producto', subTitle: "Deseas eliminar este producto?"},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {

        this.deleteProduct(productId);
        // console.log("ahora si procedemos a borrar", user.tel);
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
