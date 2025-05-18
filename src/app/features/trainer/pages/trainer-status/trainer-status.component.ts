import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Trainer } from '../../models/trainer.interface';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainer-status',
  standalone: true,
  templateUrl: './trainer-status.component.html',
  styleUrls: ['./trainer-status.component.scss'],
  imports: [CommonModule]
})
export class TrainerStatusComponent   {

}
