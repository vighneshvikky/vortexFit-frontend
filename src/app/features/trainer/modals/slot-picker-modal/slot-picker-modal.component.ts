  // import { Component, Inject, inject } from '@angular/core';
  // import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
  // import { AvailablityService } from '../../services/availablity.service';
  // import { CommonModule } from '@angular/common';
  // import { MatButtonModule } from '@angular/material/button';

  // @Component({
  //   selector: 'app-slot-picker-modal',
  //   imports: [CommonModule, MatDialogModule, MatButtonModule],
  //   templateUrl: './slot-picker-modal.component.html',
  //   styleUrl: './slot-picker-modal.component.scss',
  // })
  // export class SlotPickerModalComponent {
  //   timeSlots = [
  //     '06:00',
  //     '07:00',
  //     '08:00',
  //     '09:00',
  //     '10:00',
  //     '11:00',
  //     '12:00',
  //     '13:00',
  //     '14:00',
  //     '15:00',
  //     '16:00',
  //     '17:00',
  //     '18:00',
  //     '19:00',
  //     '20:00',
  //     '21:00',
  //   ];

  //   selectedSlots: string[] = [];
  //   isSaving = false;
  //   constructor() {
  //     this.fetchExistingAvailability();
  //   }
  //   private dialogRef = inject(MatDialogRef<SlotPickerModalComponent>);
  //   private availabilityService = inject(AvailablityService);
  //   data: string = inject(MAT_DIALOG_DATA);

  //   fetchExistingAvailability() {
  //     this.availabilityService.getMyAvailability(this.data).subscribe((res) => {
  //       this.selectedSlots = res?.slots || [];
  //     });
  //   }

  //     toggleSlot(slot: string) {
  //     if (this.selectedSlots.includes(slot)) {
  //       this.selectedSlots = this.selectedSlots.filter(s => s !== slot);
  //     } else {
  //       this.selectedSlots.push(slot);
  //     }
  //   }

  //     isSelected(slot: string): boolean {
  //     return this.selectedSlots.includes(slot);
  //   }

  //     save() {
  //     this.isSaving = true;
  //     this.availabilityService
  //       .setAvailability({ date: this.data , slots: this.selectedSlots })
  //       .subscribe({
  //         next: () => this.dialogRef.close(true),
  //         error: () => {
  //           this.isSaving = false;
            
  //         },
  //       });
  //   }

  //     close() {
  //     this.dialogRef.close(false);
  //   }

  // }

// slot-picker-modal.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AvailablityService } from '../../services/availablity.service';


@Component({
  selector: 'app-slot-picker-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './slot-picker-modal.component.html',
  styleUrls: ['./slot-picker-modal.component.scss'],
})
export class SlotPickerModalComponent {

}