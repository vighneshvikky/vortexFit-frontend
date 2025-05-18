import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';


@Component({
  selector: 'app-trainer-verification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trainer-verification.component.html',
  styleUrl: './trainer-verification.component.scss',
})
export class TrainerVerificationComponent   {

}
