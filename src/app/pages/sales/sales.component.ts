import { firstValueFrom } from 'rxjs';
import { newOperationId, operationError } from 'src/app/shared/cash.utils';
import { ModalCreditEditComponent } from 'src/app/components/modal-credit-edit/modal-credit-edit.component';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';
import { ModalSaleComponent } from 'src/app/components/modal-sale/modal-sale.component';
import { timer } from 'rxjs';
import { ModalChoiceComponentComponent } from 'src/app/components/modal-choice.component/modal-choice.component.component';
import Swal from 'sweetalert2';
import { ModalInfoSaleComponent } from 'src/app/components/modal-info-sale/modal-info-sale.component';
import { ModalPinComponent } from 'src/app/components/modal-pin/modal-pin.component';


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  displayedColumns: string[] = ['clientName', 'direccionCliente','nombreVendedor', 'dateSale', 'totalPrice', 'paymentMethod', 'state', 'actions'];
  dataSource!: MatTableDataSource<SaleModel>;

  public totalSales?:number;
  sales!:Array<SaleModel>;
  salesTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;
  local!: any
  stateBand!: string
  permissions!: any;
  today: Date = new Date();

  // daily_

  @Input() netProfit: number = 0;
  @Input() totalSales2: number = 0;
  @Input() margin: number = 0;
  @Input() salesCount: number = 0;
  @Input() avgSale: number = 0;
  @Input() partialPayment: number = 0;

  isNetProfitVisible: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private dataService: DataService,
              private paginatorIntl: MatPaginatorIntl,
              public dialog: MatDialog,
              private router: Router,
              ) {

            paginatorIntl.itemsPerPageLabel = 'items por página'; 
            this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';
            this.permissions = JSON.parse(localStorage.getItem('permissions')!) ? JSON.parse(localStorage.getItem('permissions')!) : '';
            
            
            
          
          
          }

  ngOnInit(): void {
    this.loadAllSales();
    this.loadSalesReportDayly();
  }

  toggleNetProfitVisibility(): void {
    if (this.isNetProfitVisible) {
      this.isNetProfitVisible = false;
      return;
    }

    const dialogRef = this.dialog.open(ModalPinComponent, {
      data: { info: 'verify' }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isNetProfitVisible = result === true;
    });
  }

  loadSalesReportDayly() {
    this.dataService.dayliSalesByLocal(this.local).subscribe({
                next: (res) => {
                  this.netProfit = res.ganancia_neta;
                  this.totalSales2 = res.ventas_totales;
                  this.salesCount = res.numero_ventas;
                  this.partialPayment = res.pagos_parciales_hoy;
                },
                error: (e) => {
                  console.log(e);
                }
              });
  }

  loadAllSales() {
    this.dataService.loadSales(this.currentPage, this.itemsPerPage, this.local).subscribe({
      next: (res) => {
        console.log(res);
        
        this.sales = res.data;
        this.sales.sort((a, b) => new Date(b.dateSale).getTime() - new Date(a.dateSale).getTime())  
        console.log(res);
        this.dataSource = new MatTableDataSource(this.sales);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalSales = res.total;
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



  openDialogCreate(){
    const dialogRef = this.dialog.open(ModalSaleComponent, {
      data: {customer: '', operation: "create"},
      // width: '800px',
      // height: '600px'
      width: '1180px',
      maxWidth: '96vw',
      height: '88vh',
      maxHeight: '94vh',
      panelClass: 'sale-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if( result== true) {
        
        timer(1000).subscribe(() => {

          this.loadAllSales();
          this.loadSalesReportDayly();
        });
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogUpdate(sale: any) {

  }

  openDialogInfoSale(sale: any) {
    const dialogRef = this.dialog.open(ModalInfoSaleComponent, {
      data: {data: sale, operation: "info"},
      width: '550px',
      height: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if( result== true) {

        timer(1000).subscribe(() => {

          this.loadAllSales();
        });
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  deleteSale(saleId: any) {
    console.log(saleId);
    
    this.dataService.deleteSaleById(saleId).subscribe({
      next: (res) => {
        timer(1000).subscribe(() => {

          this.loadAllSales();
          this.loadSalesReportDayly();
        });
      }
    })
  }

  async openDeleteSaleSwal(saleId: string) {
    const key = newOperationId();
    const result = await Swal.fire({
      title: 'Anular venta', input: 'textarea', inputLabel: 'Motivo de anulación',
      text: 'Se conservará la venta y se devolverá su stock. El efectivo registrado se revertirá en la caja abierta actual.',
      inputValidator: value => value.trim().length >= 3 ? null : 'Escribe un motivo de al menos 3 caracteres.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Anular venta', cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true, allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async motivo => {
        try { return await firstValueFrom(this.dataService.deleteSaleById(saleId, motivo, key)); }
        catch (error) { Swal.showValidationMessage(operationError(error as any)); return false; }
      }
    });
    if (result.isConfirmed) {
      this.loadAllSales(); this.loadSalesReportDayly();
      void Swal.fire({ title: 'Venta anulada', icon: 'success', timer: 1400, showConfirmButton: false });
    }
  }

  // openDeleteModal(saleId:any) {
  //   const dialogRef = this.dialog.open(ModalChoiceComponentComponent, {
  //     data: {title: 'Eliminar Venta', subTitle: "Deseas eliminar esta Venta?"},
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if(result == true) {

  //       this.deleteSale(saleId);
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

  async openSwal(sale: SaleModel) {
    if (sale.state !== 'cancelado') {
      this.dialog.open(ModalCreditEditComponent, {
        data: { saleCredit: sale }, width: '540px', maxWidth: '95vw', panelClass: 'expense-dialog-panel'
      }).afterClosed().subscribe(saved => { if (saved) { this.loadAllSales(); this.loadSalesReportDayly(); } });
      return;
    }
    const key = newOperationId();
    const result = await Swal.fire({
      title: 'Corregir venta no cobrada', input: 'textarea', inputLabel: 'Motivo de la corrección',
      text: 'La venta quedará a crédito por su importe total. Esta acción declara que no se cobró; no registra una devolución de efectivo.',
      inputValidator: value => value.trim().length >= 3 ? null : 'Escribe un motivo de al menos 3 caracteres.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Corregir a crédito', cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true, allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async motivo => {
        try { return await firstValueFrom(this.dataService.updatStateSaleById(sale.id, 'credito', motivo, key)); }
        catch (error) { Swal.showValidationMessage(operationError(error as any)); return false; }
      }
    });
    if (result.isConfirmed) { this.loadAllSales(); this.loadSalesReportDayly(); }
  }
}
