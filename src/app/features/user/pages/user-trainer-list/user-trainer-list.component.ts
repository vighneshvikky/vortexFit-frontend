import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-trainer-list',
  imports: [CommonModule],
  templateUrl: './user-trainer-list.component.html',
  styleUrl: './user-trainer-list.component.scss',
})
export class UserTrainerListComponent implements OnInit {
  trainers: any[] = [];

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      this.userService.getTrainer(category).subscribe({
        next: (response) => {
          this.trainers = response;
        },
        error: (err) => {
          console.log('error', err);
        },
      });
    });
  }
}
