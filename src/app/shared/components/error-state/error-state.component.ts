import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './error-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorStateComponent {
  title = input<string>('Error al cargar');
  message = input<string>();
  
  onRetry = output<void>();

  handleRetry() {
    this.onRetry.emit();
  }
}
