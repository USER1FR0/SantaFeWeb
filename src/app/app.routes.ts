import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./admin/admin-usuarios/admin-usuarios').then(m => m.AdminUsuarios)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./admin/admin-productos/admin-productos').then(m => m.AdminProductos)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./admin/admin-clientes/admin-clientes').then(m => m.AdminClientes)
      },
      {
        path: 'presentaciones',
        loadComponent: () =>
          import('./admin/admin-presentaciones/admin-presentaciones').then(m => m.AdminPresentaciones)
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./admin/admin-compras/admin-compras').then(m => m.AdminCompras)
      },
      {
        path: 'asignaciones',
        loadComponent: () =>
          import('./admin/admin-asignaciones/admin-asignaciones').then(m => m.AdminAsignaciones)
      },
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
