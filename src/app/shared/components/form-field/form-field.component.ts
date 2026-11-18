import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  label = input.required<string>();
  hint = input<string>();
  required = input<boolean>(false);
  error = input<string>();
  forId = input<string>();
}