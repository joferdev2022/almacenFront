import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { SaleRequest } from 'src/app/models/request/sale.request';
import { ProductModel } from 'src/app/models/internal/product.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-modal-sale',
  templateUrl: './modal-sale.component.html',
  styleUrls: ['./modal-sale.component.scss']
})
export class ModalSaleComponent implements OnInit{

  public saleForm!: FormGroup;

  public totalPriceView = 0;

  displayedColumns: string[] = ['name', 'category', 'measure', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?:number;
  products!:Array<ProductModel>;
  productsTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  constructor(public dialogRef: MatDialogRef<ModalSaleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog,
              private paginatorIntl: MatPaginatorIntl,) {

      this.loadAllProducts();

      paginatorIntl.itemsPerPageLabel = 'items por página';

      this.saleForm = this.fb.group({
      nombreCliente: ['', Validators.required],
      productos: this.fb.array([]),
      precioTotal: [0, Validators.min(0)],
      estado: ['cancelado', Validators.required]
    });
              }
  

  ngOnInit(): void {

    // this.addProducto();


  }

  
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

  get productos() {
    return this.saleForm.get('productos') as FormArray;
  }

  addProducto(productItem:any) {
    console.log(productItem);
    
    const productoForm = this.fb.group({
      productoId: [productItem ? productItem.id : '' , Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [productItem ? productItem.priceSale : 0, [Validators.required, Validators.min(0)]],
      productName: [productItem ? productItem.name : '', Validators.required]
    });

    this.productos.push(productoForm);
    this.updatePrecioTotal();
    console.log(this.productos.value);
    
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
    this.updatePrecioTotal();
  }

  incrementCantidad(index: number) {
    const control = this.productos.at(index).get('cantidad')!;
    control.setValue(control.value + 1);
    this.updatePrecioTotal();
  }

  // Disminuye la cantidad de un producto
  decrementCantidad(index: number) {
    const control = this.productos.at(index).get('cantidad')!;
    if (control.value > 1) {
      control.setValue(control.value - 1);
      this.updatePrecioTotal();
    }
  }

  updatePrecioTotal() {
    console.log("updateprecio");
    console.log(this.productos.controls);
    // console.log(productoForm);
    
    
    
    const total = this.productos.controls.reduce((sum, control) => {
      return sum + (control.get('cantidad')?.value * control.get('precioUnitario')?.value);
    }, 0);
    this.saleForm.patchValue({ precioTotal: total });


    this.totalPriceView = total;

    console.log(total);
    
  }

  onCreate() {

    console.log(this.saleForm.value);
    
    if(true) {
      const saleData = this.saleForm.value;
      const saleRequest = SaleRequest.createFromObject(saleData);
      this.dataService.saveSale(saleRequest).subscribe({
        next: (res) => {
          console.log(res);
          
        },
        error: (e) => {
          console.log(e);
          
        }
      })
    }
  }

  onUpdate() {

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
