import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { ReportsComponent } from './reports.component';
import { ReportChartComponent } from './report-chart.component';

@NgModule({
  declarations: [ReportsComponent, ReportChartComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule,
    RouterModule.forChild([{ path: '', component: ReportsComponent }])]
})
export class ReportsModule {}
