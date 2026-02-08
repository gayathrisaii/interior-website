import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./core/feature/feature.component').then(m => m.FeatureComponent)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes)
  },
  {
  path: 'services',
  loadComponent: () =>
    import('./core/services/services.component')
      .then(m => m.ServicesComponent)
},

  {
    path: 'contact',
    loadComponent: () =>
      import('./core/footer/footer.component')
        .then(m => m.FooterComponent)
  }
];

