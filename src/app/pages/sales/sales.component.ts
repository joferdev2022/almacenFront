import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  displayedColumns: string[] = ['clientName', 'dateSale', 'totalPrice', 'products', 'state'];
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

  constructor(private dataService: DataService) {}

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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}


