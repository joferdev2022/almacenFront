import { Component, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-modal-choice.component',
  templateUrl: './modal-choice.component.component.html',
  styleUrls: ['./modal-choice.component.component.scss']
})
export class ModalChoiceComponentComponent {
  constructor(public dialogRef: MatDialogRef<ModalChoiceComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {}
}
