import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { SaleRequest } from 'src/app/models/request/sale.request';
import { ProductModel } from 'src/app/models/internal/product.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss']
})
export class NewSaleComponent implements OnInit {

  public saleForm!: FormGroup;
  public totalPriceView = 0;

  displayedColumns: string[] = ['name', 'category', 'measure', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?: number;
  products!: Array<ProductModel>;
  productsTemp!: any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  local!: number;
  vendedores: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private paginatorIntl: MatPaginatorIntl,
    private router: Router
  ) {
    this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';
    this.loadAllProducts();

    paginatorIntl.itemsPerPageLabel = 'items por página';

    this.saleForm = this.fb.group({
      nombreVendedor: ['', Validators.required],
      nombreCliente: [''],
      direccionCliente: [''],
      productos: this.fb.array([]),
      precioTotal: [0, Validators.min(0)],
      estado: ['cancelado', Validators.required],
      local: [this.local]
    });
  }

  ngOnInit(): void {
    this.loadVendedores();
  }

  loadVendedores() {
    this.dataService.loadAllSellers(1, 100, this.local).subscribe({
      next: (res: any) => {
        console.log(res);
        this.vendedores = res.data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

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
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  get productos() {
    return this.saleForm.get('productos') as FormArray;
  }

  addProducto(productItem: any) {
    console.log(productItem);
    console.log(productItem.stock);
    if (productItem.stock <= 0) {
      console.log("no hay stock");
      alert("No hay stock disponible");
      return;
    }
    const productoForm = this.fb.group({
      productoId: [productItem ? productItem.id : '', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioBuy: [productItem ? productItem.priceBuy : 0, [Validators.required, Validators.min(0)]],
      precioUnitario: [productItem ? productItem.priceSale : 0, [Validators.required, Validators.min(0)]],
      productName: [productItem ? productItem.name : '', Validators.required],
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
    console.log(this.productos.at(index));

    const control = this.productos.at(index).get('cantidad')!;
    const productoId = this.productos.at(index).get('productoId')!.value;
    const product = this.products.find(p => p.id === productoId);

    if (control.value >= product!.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    control.setValue(control.value + 1);
    this.updatePrecioTotal();
  }

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

    const total = this.productos.controls.reduce((sum, control) => {
      return sum + (control.get('cantidad')?.value * control.get('precioUnitario')?.value);
    }, 0);
    this.saleForm.patchValue({ precioTotal: total });

    this.totalPriceView = total;

    console.log(total);
  }

  onCreate() {
    console.log(this.saleForm.value);

    if (true) {
      const saleData = this.saleForm.value;
      const saleRequest = SaleRequest.createFromObject(saleData);
      console.log(saleRequest);

      this.dataService.saveSale(saleRequest).subscribe({
        next: (res) => {
          console.log(res);
          Swal.fire({
            title: "Hecho!",
            text: "La venta se ha realizado correctamente.",
            icon: "success"
          });
          this.router.navigate(['/pages/ventas']);
        },
        error: (e) => {
          console.log(e);
          Swal.fire({
            title: "ERROR!",
            text: "La venta no se ha pudo realizar.",
            icon: "error"
          });
        }
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
