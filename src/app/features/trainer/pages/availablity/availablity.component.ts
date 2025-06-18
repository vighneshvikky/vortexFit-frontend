import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SlotPickerModalComponent } from '../../modals/slot-picker-modal/slot-picker-modal.component';

@Component({
  selector: 'app-availablity',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  templateUrl: './availablity.component.html',
  styleUrl: './availablity.component.scss',
})
export class AvailablityComponent implements OnInit {

  constructor(private dialog: MatDialog){}
  ngOnInit(): void {}

    onDateClick(date: Date) {
    const isoDate = date.toISOString().split('T')[0];
    this.dialog
      .open(SlotPickerModalComponent, {
        width: '600px',
        data: { date: isoDate },
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          // Maybe show snackbar or refresh
        }
      });
  }
}
