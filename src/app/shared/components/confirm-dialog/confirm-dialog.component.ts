import { Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  visible = model<boolean>(false);
  
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('Cancelar');
  severity = input<'success' | 'warning' | 'danger'>('warning');
  loading = input<boolean>(false);
  
  onConfirm = output<void>();
  onCancel = output<void>();

  handleConfirm() {
    this.onConfirm.emit();
  }

  handleCancel() {
    this.onCancel.emit();
    this.visible.set(false);
  }
}
