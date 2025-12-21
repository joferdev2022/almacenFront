import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { DataService } from 'src/app/services/data.service';
import { DashboardModel, LowProduct, TopProduct } from 'src/app/models/internal/dashboard.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 100;
  displayedColumns: string[] = ['index', 'productName', 'cantidad_vendida'];
  displayedColumns2: string[] = ['nombre', 'categoria', 'cantidadEnStock'];
  totalProducts: number = 0;
  totalSales: number = 0;
  amountSales: number = 0;
  monthlyProfit: number = 0;
  productsTop!:Array<TopProduct>;
  productsLow!:Array<LowProduct>;
  local!: any;
  permissions!: any;

  currentMonth!: string;

  
  
  dataSource = new MatTableDataSource<TopProduct>;
  dataSource2 = new MatTableDataSource<LowProduct>;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private _liveAnnouncer: LiveAnnouncer,
              private dataService: DataService, ) {


                this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : ''; 
                // this.permissions = JSON.parse(localStorage.getItem('permissions')!) ? JSON.parse(localStorage.getItem('permissions')!) : ''; 

              }
  ngOnInit(): void {

    this.loadDashboardData();
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const fecha = new Date();
    this.currentMonth = meses[fecha.getMonth()];

  }

  loadDashboardData(fechaInicio?: Date, fechaFin?: Date) {
    this.dataService.loadDashboard(fechaInicio, fechaFin, this.local).subscribe({
      next: (res) => {
        console.log(res);
        
        this.productsTop = res.data.topProducts;
        this.productsLow = res.data.lowProducts;
        this.dataSource = new MatTableDataSource(this.productsTop);
        this.dataSource2 = new MatTableDataSource(this.productsLow);
        this.totalProducts = res.data.totalProducts;
        this.totalSales = res.data.totalSales;
        this.amountSales = res.data.AmountSales;
        this.monthlyProfit = res.data.monthlyProfit;
        
        // this.dataSource = new MatTableDataSource(this.res);
        
        // console.log(res);
      },
      error: (e) => {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
        console.log(e);
      }
    })
  }
  // announceSortChange(sortState: Sort) {
  //   console.log(sortState);
  //   if (sortState.direction) {
  //     this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
  //   } else {
  //     this._liveAnnouncer.announce('Sorting cleared');
  //   }
  // }
}
