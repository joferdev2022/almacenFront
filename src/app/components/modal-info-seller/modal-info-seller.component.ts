import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import * as _moment from 'moment';

// import * as moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { DataService } from 'src/app/services/data.service';
import { SellerMonthlyStatsResponse } from 'src/app/models/request/seller_monthly_stats.response';



const moment = _rollupMoment || _moment;
moment.locale("es");


export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-modal-info-seller',
  templateUrl: './modal-info-seller.component.html',
  styleUrls: ['./modal-info-seller.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ModalInfoSellerComponent implements OnInit{

  currentMonth!: string;
  currentFilter: 'thisMonth' | 'previousMonth' | 'custom' = 'thisMonth';
  date = new FormControl(moment());
  selectedFilter: string = 'thisMonth';
  monthlyStats: any = {
    totalVentas: 0,
    montoTotal: 0,
    ventas: []
  };
  loading: boolean = false;

  constructor(public dialogRef: MatDialogRef<ModalInfoSellerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dataService: DataService
                ){
  
                    this.selectedFilter = 'thisMonth';
                    const meses = [
                      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                    ];
                    const fecha = new Date();
                    console.log(fecha.getMonth());
                    this.currentMonth = meses[fecha.getMonth()];
                    console.log(data);
                    
                  }

  ngOnInit() {
    // Cargar las estadísticas del mes actual cuando se abre el modal
    this.loadMonthlyStats();
  }               
  
  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue!.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue!.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.loadMonthlyStats();
  }

  setFilter(type: 'thisMonth' | 'previousMonth') {
    // let date = this.date.value;
    // if (!date) return;
    // if (type === 'thisMonth') {
    //   date = moment(); // mes actual
    // }

    // if (type === 'previousMonth') {
    //   date = moment().subtract(1, 'month'); // mes anterior
    // }

    // this.date.setValue(date);
    // this.loadMonthlyStats();
    this.currentFilter = type;
    if (type === 'thisMonth') {
      this.date.setValue(moment());
    }

    if (type === 'previousMonth') {
      this.date.setValue(moment().subtract(1, 'month'));
    }

    this.loadMonthlyStats();


  }


  onClick() {
    const selectedDate = this.date.value;
    const month = selectedDate!.month() + 1; // moment devuelve 0-11, necesitamos 1-12
    const year = selectedDate!.year();
    console.log(this.date.value?.toString());
    console.log(month);
    console.log(year);

  }

  get selectedMonthLabel(): string {
    if (!this.date.value) return '';
    return this.date.value.format('MMMM YYYY');
  }

  loadMonthlyStats() {
    this.loading = true;

    const selectedDate = this.date.value;
    const month = selectedDate!.month() + 1; // moment devuelve 0-11, necesitamos 1-12
    const year = selectedDate!.year();

    const sellerName = this.data.data.nombreVendedor;
    const local = this.data.data.local || 1; // Ajusta según tu estructura
    
    console.log(`Cargando stats para: ${sellerName}, Mes: ${month}, Año: ${year}, Local: ${local}`);

    this.dataService.getSellerMonthlyStats(sellerName, month, year, local).subscribe(
      (response: SellerMonthlyStatsResponse) => {
        console.log('Respuesta:', response);
        this.monthlyStats = response.data;
        this.loading = false;
        console.log('Total Ventas:', this.monthlyStats.totalVentas);
        console.log('Monto Total:', this.monthlyStats.montoTotal);
        console.log('Ventas:', this.monthlyStats.ventas);

      },
      (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
      }
    );
  }
}
