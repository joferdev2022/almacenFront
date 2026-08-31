import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PagesComponent } from './pages.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { MaterialModule } from '../shared/material.module';
import { AuthService } from '../services/auth.service';

@Component({ template: '<p>Contenido de la página</p>' })
class RouteContentComponent {}

describe('Navegación del layout', () => {
  let fixture: ComponentFixture<PagesComponent>;
  let mobile: BehaviorSubject<{ matches: boolean }>;
  let logout: jasmine.Spy;
  const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const click = async (selector: string) => { query(selector).click(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); };

  beforeEach(async () => {
    mobile = new BehaviorSubject<{ matches: boolean }>({ matches: false });
    logout = jasmine.createSpy('logout');
    spyOn(localStorage, 'getItem').and.callFake(key => key === 'user' ? '"local2"' : key === 'permissions' ? '1' : null);
    await TestBed.configureTestingModule({
      declarations: [PagesComponent, NavbarComponent, SidebarComponent, RouteContentComponent],
      imports: [CommonModule, A11yModule, MaterialModule, NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: 'productos', component: RouteContentComponent }])],
      providers: [
        { provide: BreakpointObserver, useValue: { observe: () => mobile.asObservable() } },
        { provide: AuthService, useValue: { logout } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PagesComponent);
    fixture.detectChanges();
  });

  it('contrae en el primer clic y vuelve a expandir en el siguiente', async () => {
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('true');
    await click('.toggle-button');
    expect(query('.app-shell').classList.contains('sidebar-expanded')).toBeFalse();
    expect(query('.nav-list').classList.contains('nav-list-open')).toBeFalse();
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('false');
    await click('.toggle-button');
    expect(query('.nav-list').classList.contains('nav-list-open')).toBeTrue();
  });

  it('mantiene el estado al navegar y responde al primer clic en la nueva página', async () => {
    await click('.toggle-button');
    await fixture.ngZone!.run(() => TestBed.inject(Router).navigateByUrl('/productos'));
    fixture.detectChanges();
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('false');
    await click('.toggle-button');
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('true');
  });

  it('inicia el menú móvil cerrado y bloquea el contenido solo mientras está abierto', async () => {
    mobile.next({ matches: true });
    fixture.detectChanges();
    expect(query('app-sidebar')).toBeNull();
    expect(query('main').hasAttribute('inert')).toBeFalse();
    await click('.toggle-button');
    expect(query('.sidebar-backdrop')).not.toBeNull();
    expect(query('main').hasAttribute('inert')).toBeTrue();
    expect(query('.nav-list').classList.contains('nav-list-open')).toBeTrue();
    await click('.sidebar-backdrop');
    expect(query('main').hasAttribute('inert')).toBeFalse();
    expect(query('app-sidebar')).toBeNull();
  });

  it('cierra con Escape y con el botón de cierre', async () => {
    mobile.next({ matches: true });
    fixture.detectChanges();
    await click('.toggle-button');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(query('.sidebar-backdrop')).toBeNull();
    await click('.toggle-button');
    await click('.mobile-heading button');
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('false');
  });

  it('cierra al seleccionar una sección incluso si ya estaba seleccionada', async () => {
    mobile.next({ matches: true });
    fixture.detectChanges();
    await click('.toggle-button');
    await click('.nav-list a[aria-label="Productos"]');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(query('.sidebar-backdrop')).toBeNull();
    await click('.toggle-button');
    await click('.nav-list a[aria-label="Productos"]');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(query('.sidebar-backdrop')).toBeNull();
  });

  it('conserva la preferencia de escritorio al pasar por móvil', async () => {
    await click('.toggle-button');
    mobile.next({ matches: true });
    fixture.detectChanges();
    await click('.toggle-button');
    mobile.next({ matches: false });
    fixture.detectChanges();
    expect(query('.sidebar-backdrop')).toBeNull();
    expect(query('.toggle-button').getAttribute('aria-expanded')).toBe('false');
    expect(query('main').hasAttribute('inert')).toBeFalse();
    await click('.toggle-button');
    expect(query('.nav-list').classList.contains('nav-list-open')).toBeTrue();
  });

  it('abre las opciones desde todo el botón de local y conserva el cierre de sesión', async () => {
    expect(query('.account-button').textContent).toContain('Local 2');
    await click('.account-button');
    await fixture.whenStable();
    const logoutButton = document.querySelector<HTMLButtonElement>('.mat-mdc-menu-item')!;
    expect(logoutButton.textContent).toContain('Cerrar sesión');
    logoutButton.click();
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
