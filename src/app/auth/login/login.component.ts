import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public loginForm!: FormGroup;
  public hide = true;
  hideSideButton = false;

  constructor(private router: Router,
              private responsive: BreakpointObserver,
              private fb: FormBuilder,
              private authService: AuthService) { }
  

  ngOnInit(): void {
    this.createForm();

    this.responsive.observe([
      Breakpoints.TabletPortrait,
      Breakpoints.HandsetLandscape])
      .subscribe(result => {
    
        const breakpoints = result.breakpoints;
        this.hideSideButton = false;
        if (result.matches) {
          this.hideSideButton = true;
        }
    
      });
  }
  
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]] 
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          // this.authService.DataUser = res.user_data; 
          // this.router.navigate(['/home']);
          this.router.navigateByUrl('/almacen/inicio');
          this.authService.saveLocalStorage(res);
        },
        error: (err) => {
          console.log(err.error.detail);
        }
      });
    }
  }

}
