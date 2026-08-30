import { Component, Input } from '@angular/core';
import { OperationAudit } from 'src/app/models/internal/cash.model';

@Component({
  selector: 'app-operation-audit',
  template: `<section *ngIf="entries.length" class="audit"><h3>Historial de la operación</h3>
    <article *ngFor="let entry of entries">
      <strong>{{ labels[entry.accion] || entry.accion }}</strong>
      <small>{{ entry.fecha | date:'dd/MM/yyyy HH:mm':'-0500' }} · {{ entry.usuarioNombre }}</small>
      <p *ngIf="entry.motivo">{{ entry.motivo }}</p>
      <ng-container *ngFor="let change of entry.cambios">
        <p *ngIf="change.nota" class="note">{{ change.nota }}</p>
        <p *ngIf="change.anterior != null && change.nuevo != null">Efectivo del origen: S/. {{ change.anterior | number:'1.2-2' }} → S/. {{ change.nuevo | number:'1.2-2' }}</p>
      </ng-container>
    </article></section>`,
  styles: [`.audit{margin-top:22px;border-top:1px solid #e3e9e5;padding-top:16px}.audit h3{font-size:15px;color:#223c30}.audit article{border-left:2px solid #d5e9dc;padding:3px 0 6px 12px;margin:12px 0}.audit small{display:block;color:#748279;margin:5px 0}.audit p{font-size:12px;margin:5px 0}.audit .note{color:#9a640c;background:#fff8e8;padding:8px;border-radius:6px}`]
})
export class OperationAuditComponent {
  @Input() entries: OperationAudit[] = [];
  labels: Record<string, string> = { CREAR: 'Registro', EDITAR: 'Edición', PAGAR: 'Pago de gasto',
    COBRAR: 'Cobro de venta', CORREGIR_COBRO: 'Corrección de cobro inexistente', ANULAR: 'Anulación' };
}
