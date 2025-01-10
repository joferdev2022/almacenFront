import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() sideNavToggled = new EventEmitter<boolean>();
  menuStatus: boolean = false;
  user: any;

  constructor() { 
    this.user = JSON.parse(localStorage.getItem('user')!) ? JSON.parse(localStorage.getItem('user')!) : '';
  }


  sideNavToggle() {
    this.menuStatus = !this.menuStatus;
    this.sideNavToggled.emit(this.menuStatus);
    console.log(this.menuStatus);
    
  }

}
