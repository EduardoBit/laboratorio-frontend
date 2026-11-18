import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STATUS_MAP, StatusSeverity } from '../../models/status-config';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  status = input.required<string>();

  statusConfig = computed(() => {
    const s = this.status();
    return STATUS_MAP[s] || { label: s, severity: 'neutral' as StatusSeverity };
  });

  badgeClasses = computed(() => {
    const severity = this.statusConfig().severity;
    const baseClasses = 'px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5';
    
    switch(severity) {
      case 'success': return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'info': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'warning': return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'danger': return `${baseClasses} bg-red-100 text-red-800`;
      case 'neutral':
      default: return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  });

  dotColorClass = computed(() => {
    const severity = this.statusConfig().severity;
    switch(severity) {
      case 'success': return 'text-emerald-500';
      case 'info': return 'text-blue-500';
      case 'warning': return 'text-amber-500';
      case 'danger': return 'text-red-500';
      case 'neutral':
      default: return 'text-gray-500';
    }
  });
}
