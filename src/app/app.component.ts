import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: ` <router-outlet /> `,
  styles: [],
})
export class AppComponent {
  title = 'vortexfit';
}
