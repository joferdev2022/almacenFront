import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';
import { ModalSaleComponent } from 'src/app/components/modal-sale/modal-sale.component';
import { timer } from 'rxjs';
import { ModalChoiceComponentComponent } from 'src/app/components/modal-choice.component/modal-choice.component.component';


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  displayedColumns: string[] = ['clientName', 'dateSale', 'totalPrice', 'products', 'actions'];
  dataSource!: MatTableDataSource<SaleModel>;

  public totalSales?:number;
  sales!:Array<SaleModel>;
  salesTemp!:any;
  currentPage?: number = 1;
  itemsPerPage?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private dataService: DataService,
              private paginatorIntl: MatPaginatorIntl,
              public dialog: MatDialog,) {

            paginatorIntl.itemsPerPageLabel = 'items por página'; 
            
              }

  ngOnInit(): void {
    this.loadAllSales();
  }

  loadAllSales() {
    this.dataService.loadSales(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        console.log(res);
        
        this.sales = res.data;
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
      width: '800px',
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
  openDialogUpdate(sale: any) {

  }

  deleteSale(saleId: any) {
    console.log(saleId);
    
    this.dataService.deleteSaleById(saleId).subscribe({
      next: (res) => {
        timer(1000).subscribe(() => {

          this.loadAllSales();
        });
      }
    })
  }

  openDeleteModal(saleId:any) {
    const dialogRef = this.dialog.open(ModalChoiceComponentComponent, {
      data: {title: 'Eliminar Venta', subTitle: "Deseas eliminar esta Venta?"},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {

        this.deleteSale(saleId);
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


