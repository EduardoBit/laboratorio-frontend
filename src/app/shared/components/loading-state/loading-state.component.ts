import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  templateUrl: './loading-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent {
  message = input<string>('Cargando...');
}
