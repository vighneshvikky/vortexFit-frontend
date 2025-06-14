import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { UserService } from '../../services/user.service';
import { NotyService } from '../../../../core/services/noty.service';
import { CommonModule } from '@angular/common';
import { onImageError } from '../../../../shared/components/methods/image-checker';

@Component({
  selector: 'app-trainer-info',
  imports: [CommonModule],
  templateUrl: './trainer-info.component.html',
  styleUrl: './trainer-info.component.scss',
})
export class TrainerInfoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private notyf = inject(NotyService);
  trainers!: Trainer;
  ngOnInit(): void {
    const trainerId = this.route.snapshot.paramMap.get('id');
    if (trainerId) {
      this.userService.getTrainerData(trainerId).subscribe({
        next: (response) => {
          this.trainers = response;
        },
        error: (err) => {
          this.notyf.showError(err)
        },
      });
    } else {
      console.log('trainer id not found');
    }
  }

  ImageError(event: Event){
  onImageError(event)
  }
}

