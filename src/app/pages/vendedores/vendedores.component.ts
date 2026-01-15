import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { timer } from 'rxjs';
import { ModalInfoSellerComponent } from 'src/app/components/modal-info-seller/modal-info-seller.component';
import { ModalPinSellerComponent } from 'src/app/components/modal-pin-seller/modal-pin-seller.component';
import { ModalPinComponent } from 'src/app/components/modal-pin/modal-pin.component';
import { ModalSellerComponent } from 'src/app/components/modal-seller/modal-seller.component';
import { SellerModel } from 'src/app/models/internal/seller.model';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.scss']
})
export class VendedoresComponent implements OnInit{

  public totalSellers?:number;
  sellers!:Array<SellerModel>;
  sellersTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;
  permissions!: any;
  local!: any

  displayedColumns: string[] = ['nombreVendedor', 'aliasVendedor', 'actions'];
  dataSource!: MatTableDataSource<SellerModel>;

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
    this.loadAllSellers();
  }

  loadAllSellers(){
    this.dataService.loadAllSellers(this.currentPage, this.itemsPerPage, this.local).subscribe({
      next: (res:any) => {
        console.log(res);
        // this.sellers = SellerModel.createFromObjects(resp.sellers);
        // this.sellersTemp = resp.sellers;
        // this.totalSellers = resp.total;
        // this.itemsPerPage = resp.itemsPerPage;

        // this.dataSource = new MatTableDataSource(this.sellers);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        this.sellers = res.data;
        this.dataSource = new MatTableDataSource(this.sellers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.totalSellers = res.total;
        this.itemsPerPage = res.xpage;
        this.currentPage = res.page! ;
        
      },
      error: (err) => {
        console.log(err);
        
      }
    })
  }


  openDialogPin() {
      const dialogRef = this.dialog.open(ModalPinSellerComponent, {
        data: {info: 'create'}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if( result== true) {
          Swal.fire({
            title: "Hecho!",
            text: "El Vendedor se ha creado correctamente.",
            icon: "success"
          });
          timer(1000).subscribe(() => {
          this.loadAllSellers();
        });
      } else if (result === false) {
        Swal.fire({
          title: "Error",
          text: "No se pudo Crear el vendedor. Intenta nuevamente.",
          icon: "error"
        });
      }
  
        // console.log(result);
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

  openDialogPinUpdate(seller: any) {
    const dialogRef = this.dialog.open(ModalPinSellerComponent, {
      data: {info: 'update', seller: seller }
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result== true) {
        timer(1000).subscribe(() => {
        this.loadAllSellers();
      });
    }
      // console.log(result);
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogInfoSeller(seller: any) {
    const dialogRef = this.dialog.open(ModalInfoSellerComponent, {
          data: {data: seller, operation: "info"},
          width: '550px',
          height: '600px'
        });

        dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      // if( result== true) {

      //   timer(1000).subscribe(() => {

      //     this.loadAllSales();
      //   });
        
      // }
      console.log(`Dialog result: ${result}`);
    });
    
  }
  
  openDeleteSellerSwal(sellerId:any) {
        Swal.fire({
          // title: 'deseas cambiar el estado de esta venta?',
          text: '¿Deseas eliminar este Vendedor?',
          // text: `deseas cambiar el estado de ${val}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Si',
          cancelButtonText: 'No'
        }).then((result) => {
          console.log(result);
          
          if (result.isConfirmed) {
            // this.changeState(val);
    
            this.dataService.deleteSellerById(sellerId).subscribe({
              next: (res) => {
                Swal.fire({
                  title: "Hecho!",
                  text: "El Vendedor se ha eliminado correctamente.",
                  icon: "success"
                });
                timer(1000).subscribe(() => {
                  this.loadAllSellers();
                });
              }
            })
            
          }
    
        })
      }
}
