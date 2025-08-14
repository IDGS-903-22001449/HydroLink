import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isLoggedIn()) {
    console.log('AdminGuard: Usuario no autenticado, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }

  const userRoles = authService.getRoles();
  console.log('AdminGuard: Roles del usuario:', userRoles);

  const hasAccess = userRoles?.includes('Admin') ||
                   userRoles?.includes('Administrator') ||
                   userRoles?.includes('Employee') ||
                   userRoles?.includes('Empleado');
  console.log('AdminGuard: ¿Tiene acceso?', hasAccess);

  if (!hasAccess) {
    console.log('AdminGuard: Usuario sin permisos, redirigiendo a products');
    notificationService.warning('No tienes permisos para acceder a esta sección. Solo los administradores y empleados pueden acceder al panel de administración.');
    router.navigate(['/products']);
    return false;
  }

  console.log('AdminGuard: Acceso permitido');
  return true;
};
