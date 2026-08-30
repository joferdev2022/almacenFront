import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CASH_CLOSED_ALERT, isCashClosedError, newOperationId, operationError } from 'src/app/shared/cash.utils';
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
  readonly operationId = newOperationId();
  saving = false;
  error = '';
  paymentMethods: string[] = [];

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
      nombreVendedor: [''],
      nombreCliente: [''],
      direccionCliente: [''],
      paymentMhetod: ['efectivo', Validators.required],
      productos: this.fb.array([]),
      precioTotal: [0, Validators.min(0)],
      estado: ['cancelado', Validators.required],
      local: [this.local]
    });
  }

  ngOnInit(): void {
    this.dataService.loadExpenseOptions().subscribe({
      next: response => this.paymentMethods = response.data.metodosPago.filter(method => method !== 'TARJETA'),
      error: error => this.error = operationError(error)
    });
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
    if (this.saving) { return; }
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
    if (this.saving) { return; }
    this.productos.removeAt(index);
    this.updatePrecioTotal();
  }

  incrementCantidad(index: number) {
    if (this.saving) { return; }
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
    if (this.saving) { return; }
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

  private handleSaveError(error: HttpErrorResponse): void {
    this.error = operationError(error);
    if (!isCashClosedError(error)) { return; }
    void Swal.fire({
      title: 'Caja cerrada', text: CASH_CLOSED_ALERT, icon: 'warning',
      confirmButtonText: 'Entendido', confirmButtonColor: '#26874a'
    });
  }

  onCreate() {
    if (this.saving) { return; }
    if (this.saleForm.invalid || !this.productos.length || this.totalPriceView <= 0) {
      this.saleForm.markAllAsTouched();
      this.error = 'Agrega al menos un producto con un importe válido.';
      return;
    }
    const request = SaleRequest.createFromObject(this.saleForm.getRawValue());
    this.saving = true;
    this.error = '';
    this.saleForm.disable({ emitEvent: false });
    this.dataService.saveSale(request, this.operationId).pipe(finalize(() => {
      this.saving = false;
      this.saleForm.enable({ emitEvent: false });
    })).subscribe({
      next: () => {
        void Swal.fire({ title: 'Venta registrada', icon: 'success', timer: 1400, showConfirmButton: false });
        this.router.navigate(['/almacen/ventas']);
      },
      error: error => this.handleSaveError(error)
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
