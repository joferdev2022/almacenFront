import { Component, DestroyRef, HostListener } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Overlay } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent {
  sideNavStatus = true;
  isMobile = false;
  mobileMenuOpen = false;
  private readonly mobileScrollStrategy = this.overlay.scrollStrategies.block();

  constructor(breakpoints: BreakpointObserver, router: Router, destroyRef: DestroyRef, private overlay: Overlay) {
    breakpoints.observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(({ matches }) => {
        this.isMobile = matches;
        this.closeMobileMenu();
      });

    router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(destroyRef))
      .subscribe(() => this.closeMobileMenu());

    destroyRef.onDestroy(() => this.mobileScrollStrategy.disable());
  }

  get navigationExpanded(): boolean {
    return this.isMobile ? this.mobileMenuOpen : this.sideNavStatus;
  }

  toggleNavigation(): void {
    if (this.isMobile) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (this.mobileMenuOpen) {
        this.mobileScrollStrategy.enable();
      } else {
        this.mobileScrollStrategy.disable();
      }
      return;
    }
    this.sideNavStatus = !this.sideNavStatus;
  }

  @HostListener('document:keydown.escape')
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileScrollStrategy.disable();
  }
}
