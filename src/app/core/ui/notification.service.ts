import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  success(detail: string, summary: string = '¡Éxito!'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 3000 });
  }

  error(detail: string, summary: string = 'Error'): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 5000 });
  }

  warn(detail: string, summary: string = 'Atención'): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 4000 });
  }

  info(detail: string, summary: string = 'Información'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 3000 });
  }
}
