import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { canReadReports } from '../shared/report.utils';

// Protección visual; el backend vuelve a verificar usuario, permiso y local.
export const reportsGuard: CanActivateFn = () => canReadReports() || inject(Router).createUrlTree(['/almacen/inicio']);
