import { Component, Input, OnChanges } from '@angular/core';
import { ReportChartDatum } from '../../models/internal/report.model';

@Component({
  selector: 'app-report-chart', templateUrl: './report-chart.component.html',
  styleUrls: ['./report-chart.component.scss']
})
export class ReportChartComponent implements OnChanges {
  @Input() title = '';
  @Input() data: ReportChartDatum[] = [];
  @Input() type: 'line' | 'bar' | 'horizontal' = 'bar';
  @Input() currency = false;
  width = 600;
  maximum = 1;
  barWidth = 24;
  polyline = '';
  points: (ReportChartDatum & { x: number; y: number; height: number })[] = [];
  ticks: { y: number; value: number }[] = [];

  ngOnChanges(): void {
    this.width = Math.max(540, this.data.length * 62 + 76);
    this.maximum = Math.max(1, ...this.data.map(row => row.value));
    const step = (this.width - 90) / Math.max(this.data.length, 1);
    this.barWidth = Math.min(32, step * .55);
    this.points = this.data.map((row, index) => ({ ...row, x: 70 + (index + .5) * step,
      y: 200 - row.value / this.maximum * 160, height: row.value / this.maximum * 160 }));
    this.polyline = this.points.map(point => `${point.x},${point.y}`).join(' ');
    this.ticks = [0, .25, .5, .75, 1].map(fraction => ({ y: 200 - fraction * 160, value: this.maximum * fraction }));
  }

  format(value: number, compact = false): string {
    return new Intl.NumberFormat('es-PE', {
      ...(this.currency ? { style: 'currency', currency: 'PEN' } : {}),
      notation: compact ? 'compact' : 'standard',
      minimumFractionDigits: this.currency && !compact ? 2 : 0,
      maximumFractionDigits: compact ? 1 : this.currency ? 2 : 3
    }).format(value);
  }
}
