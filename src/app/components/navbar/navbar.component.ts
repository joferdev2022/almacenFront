import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() navigationExpanded = true;
  @Input() isMobile = false;
  @Output() sideNavToggled = new EventEmitter<void>();
  user = '';

  constructor(private authService: AuthService) {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      this.user = typeof storedUser === 'string' ? storedUser : '';
    } catch {
      this.user = '';
    }
  }

  get accountLabel(): string {
    return this.user.replace(/^local\s*(\d+)$/i, 'Local $1') || 'Mi cuenta';
  }

  get toggleLabel(): string {
    return this.isMobile
      ? (this.navigationExpanded ? 'Cerrar menú' : 'Abrir menú')
      : (this.navigationExpanded ? 'Contraer menú' : 'Expandir menú');
  }

  logout(): void {
    this.authService.logout();
  }
}
