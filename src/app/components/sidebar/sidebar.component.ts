import { Component, EventEmitter, Input, Output } from '@angular/core';
import { canReadReports } from '../../shared/report.utils';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  get showReports(): boolean { return canReadReports(); }
  @Input() sideNavStatus = false;
  @Input() isMobile = false;
  @Output() navigationSelected = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();
}
