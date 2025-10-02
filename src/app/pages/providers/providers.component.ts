import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { timer } from 'rxjs';
import { ModalPayProviderComponent } from 'src/app/components/modal-pay-provider/modal-pay-provider.component';
import { ModalPinProviderComponent } from 'src/app/components/modal-pin-provider/modal-pin-provider.component';
import { ModalViewProviderComponent } from 'src/app/components/modal-view-provider/modal-view-provider.component';
import { ProviderModel } from 'src/app/models/internal/provider.model';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {
    public totalProviders?:number;
    providers!:Array<ProviderModel>;
    providersTemp!:any;
    currentPage?: number = 1;
    itemsPerPage?: number;
    permissions!: any;
    local!: any
  
    displayedColumns: string[] = ['nombreProvider', 'numeroProvider', "fechaCredito", "ultimoPago", "deudaInicial" ,'deudaActual', 'estadoProvider', 'actions'];
    dataSource!: MatTableDataSource<ProviderModel>;
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(  private dataService: DataService,
                    private paginatorIntl: MatPaginatorIntl,
                    public dialog: MatDialog,) {
        paginatorIntl.itemsPerPageLabel = 'items por página'; 
        this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';
        this.permissions = JSON.parse(localStorage.getItem('permissions')!) ? JSON.parse(localStorage.getItem('permissions')!) : '';
                
      }

    
    ngOnInit(): void {
        this.loadAllProviders();
    }

    loadAllProviders(){
        this.dataService.loadAllProviders(this.currentPage, this.itemsPerPage, this.local).subscribe({
          next: (res:any) => {
            console.log(res);
            this.providers = res.data.reverse();
            this.dataSource = new MatTableDataSource(this.providers);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.totalProviders = res.total;
            this.itemsPerPage = res.xpage;
            this.currentPage = res.page! ;
            
    
          },
          error: (err : any) => {
            console.log(err);
            
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


    openDialogPin() {
          const dialogRef = this.dialog.open(ModalPinProviderComponent, {
            data: {info: 'create'}
          });
      
          dialogRef.afterClosed().subscribe(result => {
            if( result== true) {
              Swal.fire({
                title: "Hecho!",
                text: "El Proveedor se ha creado correctamente.",
                icon: "success"
              });
              timer(1000).subscribe(() => {
              this.loadAllProviders();
            });
          } else if (result === false) {
            Swal.fire({
              title: "Error",
              text: "No se pudo Crear el proveedor. Intenta nuevamente.",
              icon: "error"
            });
          }
      
            // console.log(result);
            console.log(`Dialog result: ${result}`);
          });
      }

    openDialogPinUpdate(provider: any) {
        const dialogRef = this.dialog.open(ModalPinProviderComponent, {
          data: {info: 'update', provider: provider }
        });
      
        dialogRef.afterClosed().subscribe(result => {
          if( result== true) {
            timer(1000).subscribe(() => {
            this.loadAllProviders();
          });
        }
            // console.log(result);
          console.log(`Dialog result: ${result}`);
        });
      }

      openDeleteProviderSwal(sellerId:any) {
                Swal.fire({
                  // title: 'deseas cambiar el estado de esta venta?',
                  text: '¿Deseas eliminar este Proveedor?',
                  // text: `deseas cambiar el estado de ${val}`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Si',
                  cancelButtonText: 'No'
                }).then((result) => {
                  console.log(result);
                  
                  if (result.isConfirmed) {
                    // this.changeState(val);
            
                    this.dataService.deleteProviderById(sellerId).subscribe({
                      next: (res: any) => {
                        Swal.fire({
                          title: "Hecho!",
                          text: "El Proveedor se ha eliminado correctamente.",
                          icon: "success"
                        });
                        timer(1000).subscribe(() => {
                          this.loadAllProviders();
                        });
                      }
                    })
                    
                  }
            
                })
              }

  openDialogPinPay(provider: any) {
    const dialogRef = this.dialog.open(ModalPayProviderComponent, {
      data: {info: 'pay', provider: provider }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if( result== true) {
        timer(1000).subscribe(() => {
        this.loadAllProviders();
      });
    }
        // console.log(result);
      console.log(`Dialog result: ${result}`);
    });
  }
  openDialogProviderView(provider: any) {
    const dialogRef = this.dialog.open(ModalViewProviderComponent, {
      data: {info: 'pay', provider: provider }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if( result== true) {
        timer(1000).subscribe(() => {
        this.loadAllProviders();
      });
    }
        // console.log(result);
      console.log(`Dialog result: ${result}`);
    });
  }



}
