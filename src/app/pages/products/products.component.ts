import { Component, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { DataService } from 'src/app/services/data.service';
import { ProductModel } from 'src/app/models/internal/product.model';
import { ModalProductComponentComponent } from 'src/app/components/modal-product.component/modal-product.component.component';
import { ModalChoiceComponentComponent } from 'src/app/components/modal-choice.component/modal-choice.component.component';
import { ModalPinComponent } from 'src/app/components/modal-pin/modal-pin.component';
import { ModalProductExcelComponent } from 'src/app/components/modal-product-excel/modal-product-excel.component';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})

export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'category', 'measure', 'priceBuy', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?: number;
  products!: Array<ProductModel>;
  productsTemp!: any;
  currentPage?: number = 1;
  itemsPerPage?: number;
  local!: any;
  permissions!: any;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService,
    private paginatorIntl: MatPaginatorIntl,
    public dialog: MatDialog) {

    paginatorIntl.itemsPerPageLabel = 'items por página';
    this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';
    this.permissions = JSON.parse(localStorage.getItem('permissions')!) ? JSON.parse(localStorage.getItem('permissions')!) : '';


  }
  ngOnInit(): void {
    this.loadAllProducts();

  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }


  loadAllProducts() {
    this.dataService.loadProducts(this.currentPage, this.itemsPerPage, this.local).subscribe({
      next: (res) => {
        console.log(res);

        this.products = res.data;
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalProducts = res.total;
        this.itemsPerPage = res.xpage;
        this.currentPage = res.page!;
        // console.log(res);
      },
      error: (e) => {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
        console.log(e);
      }
    })

  }

  openDialogPin() {
    const dialogRef = this.dialog.open(ModalPinComponent, {
      data: { info: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        Swal.fire({
          title: "Hecho!",
          text: "El producto se ha creado correctamente.",
          icon: "success"
        });
        timer(1000).subscribe(() => {
          this.loadAllProducts();
        });
      } else if (result === false) {
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el producto. Intenta nuevamente.",
          icon: "error"
        });
      }

      // console.log(result);
      console.log(`Dialog result: ${result}`);
    });
  }
  openDialogPinUpdate(product: any) {
    const dialogRef = this.dialog.open(ModalPinComponent, {
      data: { info: 'update', product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        timer(1000).subscribe(() => {
          this.loadAllProducts();
        });
      }
      // console.log(result);
      console.log(`Dialog result: ${result}`);
    });
  }


  openDialogPinUploadExcel() {
    const dialogRef = this.dialog.open(ModalPinComponent, {
      data: { info: 'excel' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.dataService.excelUploadResponse$.subscribe((response: any) => {
          Swal.fire({
            title: "Hecho!",
            text: `Los productos se han agregado correctamente.\n${response.inserted_count} insertados, ${response.updated_count} actualizados`,
            icon: "success"
          });
          timer(1000).subscribe(() => {
            this.loadAllProducts();
          });
        });
      } else if (result === false) {
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar los productos. Intenta nuevamente.",
          icon: "error"
        });
      }

      // console.log(result);
      console.log(`Dialog result: ${result}`);
    });

  }
  openDialogCreate() {
    const dialogRef = this.dialog.open(ModalProductComponentComponent, {
      data: { customer: '', operation: "create" }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if (result == true) {

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
      data: { product: product, operation: "update" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if (result == true) {

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

  openDeleteProductSwal(productId: any) {
    Swal.fire({
      // title: 'deseas cambiar el estado de esta venta?',
      text: '¿Deseas eliminar este producto?',
      // text: `deseas cambiar el estado de ${val}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      console.log(result);

      if (result.isConfirmed) {
        // this.changeState(val);

        this.dataService.deleteProductById(productId).subscribe({
          next: (res) => {
            Swal.fire({
              title: "Hecho!",
              text: "El producto se ha eliminado correctamente.",
              icon: "success"
            });
            timer(1000).subscribe(() => {
              this.loadAllProducts();
            });
          }
        })

      }

    })
  }

  // openDeleteModal(productId:any) {
  //   const dialogRef = this.dialog.open(ModalChoiceComponentComponent, {
  //     data: {title: 'Eliminar Producto', subTitle: "Deseas eliminar este producto?"},
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if(result == true) {

  //       this.deleteProduct(productId);
  //       // console.log("ahora si procedemos a borrar", user.tel);

  //     }
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadExcel() {
  Swal.fire({
    title: "Descargando...",
    text: "Por favor espera mientras se descarga el archivo.",
    icon: "info",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.dataService.DownloadProductsExcel(this.local);
  
  timer(2000).subscribe(() => {
    Swal.close();
  });
}
}
