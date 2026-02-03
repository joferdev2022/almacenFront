import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { ModalProductComponentComponent } from '../modal-product.component/modal-product.component.component';

@Component({
  selector: 'app-modal-product-excel',
  templateUrl: './modal-product-excel.component.html',
  styleUrls: ['./modal-product-excel.component.scss']
})
export class ModalProductExcelComponent implements OnInit {

  


  file: File | null = null;
  progress = 0;
  status = 'Pendiente';
  dragging = false;
  local!: any;
  constructor(public dialogRef: MatDialogRef<ModalProductComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dataService: DataService,
    public dialog: MatDialog) {

    this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';

  }
  ngOnInit(): void {

  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;

    if (event.dataTransfer?.files.length) {
      this.setFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    this.setFile(event.target.files[0]);
  }

  setFile(file: File) {
    if (!file.name.match(/\.(xls|xlsx)$/)) {
      this.status = 'Formato inválido';
      return;
    }
    this.file = file;
    this.status = 'Archivo listo para subir';
  }

  onUpload() {

    if (!this.file) {
      this.status = 'Por favor selecciona un archivo';
      return;
    }

    this.status = 'Subiendo...';
    this.progress = 0;

    this.dataService.uploadProductsExcel(this.file, this.local).subscribe(
      (response: any) => {
        this.progress = 100;
        this.status = `Completado - ${response.inserted_count} insertados, ${response.updated_count} actualizados`;


        this.dataService.excelUploadResponse$.next(response);
        // Cerrar el diálogo después de 2 segundos
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 2000);
      },
      (error: any) => {
        this.progress = 0;
        this.status = `Error: ${error.error.detail || 'Error al procesar el archivo'}`;
        console.error('Error al subir archivo:', error);
      }
    );
  }
}
