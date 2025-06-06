import { Component } from '@angular/core';
import { TrainerSidebarComponent } from '../trainer-sidebar/trainer-sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trainer-layout',
  imports: [TrainerSidebarComponent, RouterModule],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.scss'
})
export class TrainerLayoutComponent {

}
