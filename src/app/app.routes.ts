import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes)
  }
];

