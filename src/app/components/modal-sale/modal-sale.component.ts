import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CASH_CLOSED_ALERT, isCashClosedError, newOperationId, operationError } from 'src/app/shared/cash.utils';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { SaleRequest } from 'src/app/models/request/sale.request';
import { ProductModel } from 'src/app/models/internal/product.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-sale',
  templateUrl: './modal-sale.component.html',
  styleUrls: ['./modal-sale.component.scss']
})
export class ModalSaleComponent implements OnInit{

  public saleForm!: FormGroup;

  public totalPriceView = 0;
  readonly operationId = newOperationId();
  saving = false;
  error = '';
  paymentMethods: string[] = [];

  // selected = 'option2';

  displayedColumns: string[] = ['name', 'category', 'measure', 'priceSale', 'stock', 'actions'];
  dataSource!: MatTableDataSource<ProductModel>;

  public totalProducts?:number;
  products!:Array<ProductModel>;
  productsTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  local!: number;

  // vendedores: any[] = [
  //   {value: 'Vendedor1', viewValue: 'Vendedor1'},
  //   {value: 'Vendedor2', viewValue: 'Vendedor2'},
  //   {value: 'Vendedor3', viewValue: 'Vendedor3'},
  // ];

  vendedores: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  constructor(public dialogRef: MatDialogRef<ModalSaleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog,
              private paginatorIntl: MatPaginatorIntl,) {

      this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';                 
      this.loadAllProducts();

      paginatorIntl.itemsPerPageLabel = 'items por página';

      this.saleForm = this.fb.group({
      nombreVendedor: [''],
      nombreCliente: ['',],
      direccionCliente: ['', ],
      paymentMhetod: ['efectivo', Validators.required],
      productos: this.fb.array([]),
      precioTotal: [0, Validators.min(0)],
      estado: ['cancelado', Validators.required],
      local: [this.local]
    });
    this.saleForm.controls['estado'].valueChanges.subscribe(state => this.configurePaymentMethod(state));
    this.configurePaymentMethod(this.saleForm.controls['estado'].value);
              }
  

  ngOnInit(): void {
    this.dataService.loadExpenseOptions().subscribe({
      next: response => this.paymentMethods = response.data.metodosPago.filter(method => method !== 'TARJETA'),
      error: error => this.error = operationError(error)
    });

    // this.addProducto();

    this.loadVendedores();

  }

  private readonly paymentIcons: Record<string, string> = {
    EFECTIVO: 'assets/icons/payment-methods/efectivo.png',
    YAPE: 'assets/icons/payment-methods/yape.png',
    PLIN: 'assets/icons/payment-methods/plin.png',
    TRANSFERENCIA: 'assets/icons/payment-methods/transferencia.png',
    OTRO: 'assets/icons/payment-methods/otro.png'
  };

  paymentIcon(method: string): string {
    return this.paymentIcons[method] || this.paymentIcons['OTRO'];
  }

  private configurePaymentMethod(state: string): void {
    const method = this.saleForm.controls['paymentMhetod'];
    if (state === 'cancelado') {
      method.setValidators(Validators.required);
      if (!method.value) { method.setValue('efectivo', { emitEvent: false }); }
    } else {
      method.clearValidators();
      method.setValue(null, { emitEvent: false });
    }
    method.updateValueAndValidity({ emitEvent: false });
  }

  loadVendedores() {
    this.dataService.loadAllSellers(1, 100, this.local).subscribe({
      next: (res:any) => {
        this.vendedores = res.data;
        
      },
      error: (err) => {
        
      }
    })
  }
  
  loadAllProducts() {
    this.dataService.loadProducts(this.currentPage, this.itemsPerPage, this.local).subscribe({
      next: (res) => {
        
        this.products = res.data;
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalProducts = res.total;
        this.itemsPerPage = res.xpage;
        this.currentPage = res.page! ;
      },
      error: (e) => {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
      }
    })

  }

  get productos() {
    return this.saleForm.get('productos') as FormArray;
  }

  addProducto(productItem:any) {
    if (this.saving) { return; }
    if(productItem.stock <= 0) {
      alert("No hay stock disponible");
      return;
    }


    const existingProductIndex = this.productos.controls.findIndex(
      (control) => control.get('productoId')!.value === productItem.id,
    );



    if (existingProductIndex >= 0) {
      this.incrementCantidad(existingProductIndex);
      return;
    }



    const productoForm = this.fb.group({
      productoId: [productItem ? productItem.id : '' , Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioBuy: [productItem ? productItem.priceBuy : 0, [Validators.required, Validators.min(0)]],
      precioUnitario: [productItem ? productItem.priceSale : 0, [Validators.required, Validators.min(0)]],
      productName: [productItem ? productItem.name : '', Validators.required],
      measure: [productItem ? productItem.measure : ''],
    });


    this.productos.push(productoForm);
    this.updatePrecioTotal();
    
    
  }

  removeProducto(index: number) {
    if (this.saving) { return; }
    this.productos.removeAt(index);
    this.updatePrecioTotal();
  }

  incrementCantidad(index: number) {
    if (this.saving) { return; }
    
    
    const control = this.productos.at(index).get('cantidad')!;
    const productoId = this.productos.at(index).get('productoId')!.value;
    const product = this.products.find(p => p.id === productoId);

    if(control.value >= product!.stock) {
      alert("No hay suficiente stock disponible");
      return;

    }
    

    control.setValue(control.value + 1);
    this.updatePrecioTotal();
  }

  // Disminuye la cantidad de un producto
  decrementCantidad(index: number) {
    if (this.saving) { return; }
    const control = this.productos.at(index).get('cantidad')!;
    if (control.value > 1) {
      control.setValue(control.value - 1);
      this.updatePrecioTotal();
    }
  }

  updatePrecioTotal() {
    
    
    
    const total = this.productos.controls.reduce((sum, control) => {
      return sum + (control.get('cantidad')?.value * control.get('precioUnitario')?.value);
    }, 0);
    this.saleForm.patchValue({ precioTotal: total });


    this.totalPriceView = total;

    
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
    this.dialogRef.disableClose = true;
    this.dataService.saveSale(request, this.operationId).pipe(finalize(() => {
      this.saving = false;
      this.saleForm.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => {
        void Swal.fire({ title: 'Venta registrada', icon: 'success', timer: 1400, showConfirmButton: false });
        this.dialogRef.close(true);
      },
      error: error => this.handleSaveError(error)
    });
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
