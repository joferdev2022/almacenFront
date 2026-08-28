import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExpenseModel } from 'src/app/models/internal/expense.model';

@Component({
  selector: 'app-modal-info-expense',
  templateUrl: './modal-info-expense.component.html',
  styleUrls: ['../modal-expense/modal-expense.component.scss']
})
export class ModalInfoExpenseComponent {
  constructor(public dialogRef: MatDialogRef<ModalInfoExpenseComponent>,
    @Inject(MAT_DIALOG_DATA) public expense: ExpenseModel) {}
}
