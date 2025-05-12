// noty.service.ts
import { Injectable } from '@angular/core';
import Noty from 'noty';

@Injectable({ providedIn: 'root' })
export class NotyService {
  showSuccess(message: string) {
    new Noty({
      type: 'success',
      layout: 'topRight',
      theme: 'mint', 
      text: message,
      timeout: 2000, 
      progressBar: true,
      killer: true 
    }).show();
  }

  showError(message: string) {
    new Noty({
      type: 'error',
      layout: 'topRight',
      theme: 'mint',
      text: message,
      timeout: 3000,
      progressBar: true,
      killer: true
    }).show();
  }

  showInfo(message: string) {
    new Noty({
      type: 'info',
      layout: 'topRight',
      theme: 'mint',
      text: message,
      timeout: 2500,
      progressBar: true,
      killer: true
    }).show();
  }
}
