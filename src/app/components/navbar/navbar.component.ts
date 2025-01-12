import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() sideNavToggled = new EventEmitter<boolean>();
  menuStatus: boolean = false;
  user: any;

  constructor(private authService: AuthService) { 
    this.user = JSON.parse(localStorage.getItem('user')!) ? JSON.parse(localStorage.getItem('user')!) : '';
  }


  sideNavToggle() {
    this.menuStatus = !this.menuStatus;
    this.sideNavToggled.emit(this.menuStatus);
    console.log(this.menuStatus);
    
  }

  logout() {
    this.authService.logout();
  }

}
