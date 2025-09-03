import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2'
import { timer } from 'rxjs';
import { ModalCreditEditComponent } from 'src/app/components/modal-credit-edit/modal-credit-edit.component';
import { ModalInfoSaleComponent } from 'src/app/components/modal-info-sale/modal-info-sale.component';


@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent {

  displayedColumns: string[] = ['clientName', 'direccionCliente', 'nombreVendedor', 'dateSale','totalPriceSale', 'totalDebt', 'state', 'actions'];
  dataSource!: MatTableDataSource<SaleModel>;


  stateBand!: string
  local!: any
  public totalSales?:number;
  sales!:Array<SaleModel>;
  salesTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;
  permissions!: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService,
                private paginatorIntl: MatPaginatorIntl,
                public dialog: MatDialog,) {
  
              paginatorIntl.itemsPerPageLabel = 'items por página'; 
              this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';
              this.permissions = JSON.parse(localStorage.getItem('permissions')!) ? JSON.parse(localStorage.getItem('permissions')!) : '';
                }

  ngOnInit(): void {
    this.loadCreditSales();
  }

  loadCreditSales() {
      this.dataService.loadSalesWithCredit(this.currentPage, this.itemsPerPage, this.local).subscribe({
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
    openSwal(val: any) {
        console.log(val);
          this.stateBand = val.state === 'cancelado' ? 'credito' : 'cancelado';
           
          console.log(this.stateBand);
          
          
          Swal.fire({
            // title: 'deseas cambiar el estado de esta venta?',
            text: '¿Deseas cambiar el estado de esta venta?',
            // text: `deseas cambiar el estado de ${val}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
          }).then((result) => {
            console.log(result);
            
            if (result.isConfirmed) {
              // this.changeState(val);
    
              this.dataService.updatStateSaleById(val.id, this.stateBand).subscribe({
                next: (res) => {
                  Swal.fire({
                    title: "Hecho!",
                    text: "El estado de esta venta ha sido cambiado.",
                    icon: "success"
                  });
                  timer(1000).subscribe(() => {
                    this.loadCreditSales();
                  });
                }
              })
              
            }
    
          })
  }

  openDialogUpdate(saleCredit: any) {
      console.log(saleCredit);
      
      const dialogRef = this.dialog.open(ModalCreditEditComponent, {
        data: {saleCredit: saleCredit, operation: "update"}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
  
        if( result== true) {
  
          timer(1000).subscribe(() => {
  
            this.loadCreditSales();
          });
          
        }
        console.log(`Dialog result: ${result}`);
      });
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

          this.loadCreditSales();
        });
        
      }
      console.log(`Dialog result: ${result}`);
    });
  }
          
}
