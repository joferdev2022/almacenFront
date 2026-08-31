import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { reportsGuard } from '../guards/reports.guard';
import { canReadReports, reportDownloadError, reportMonthLabel } from './report.utils';

describe('Permisos y errores de Reportes', () => {
  let previous: string | null;
  beforeEach(() => previous = localStorage.getItem('permissions'));
  afterEach(() => previous === null ? localStorage.removeItem('permissions') : localStorage.setItem('permissions', previous));

  it('restringe Reportes al permiso 1, admitiendo su formato numérico o texto heredado', () => {
    for (const value of ['1', '"1"']) { localStorage.setItem('permissions', value); expect(canReadReports()).toBeTrue(); }
    for (const value of ['0', 'null', 'broken', '2']) { localStorage.setItem('permissions', value); expect(canReadReports()).toBeFalse(); }
  });
  it('el guard redirige a usuarios sin permiso y permite al administrador', () => {
    const redirect = new UrlTree();
    const router = jasmine.createSpyObj('Router', ['createUrlTree']); router.createUrlTree.and.returnValue(redirect);
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    localStorage.setItem('permissions', '0');
    expect(TestBed.runInInjectionContext(() => reportsGuard({} as any, {} as any))).toBe(redirect);
    localStorage.setItem('permissions', '1');
    expect(TestBed.runInInjectionContext(() => reportsGuard({} as any, {} as any))).toBeTrue();
  });
  it('lee errores JSON recibidos como blob en la descarga', async () => {
    const error = new HttpErrorResponse({ status: 422, error: new Blob([JSON.stringify({ detail: 'Reduce el período' })]) });
    expect(await reportDownloadError(error)).toBe('Reduce el período');
  });
  it('tolera respuestas de descarga no JSON y etiqueta los meses sin conversiones UTC', async () => {
    expect(await reportDownloadError(new HttpErrorResponse({ status: 500, error: new Blob(['error']) }))).toContain('No se pudo generar');
    expect(reportMonthLabel('2026-01')).toBe('ene 2026');
  });
});
