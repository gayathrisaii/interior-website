import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/home/home.component').then(m => m.HomeComponent),
    data: {
      seo: {
        title: 'Interior Design & Construction | Dream2Decor',
        description: 'Dream2Decor creates elegant home interiors, modular kitchens, custom wardrobes, and construction solutions tailored to your lifestyle.'
      }
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./core/feature/feature.component').then(m => m.FeatureComponent),
    data: {
      seo: {
        title: 'About Dream2Decor | Interior Design & Construction',
        description: 'Learn about Dream2Decor and our approach to residential and commercial construction and interior design.'
      }
    }
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
    data: {
      seo: {
        title: 'Products | Dream2Decor',
        description: 'Explore Dream2Decor interior design products.',
        robots: 'noindex,follow'
      }
    }
  },
  {
  path: 'services',
  loadComponent: () =>
    import('./core/services/services.component')
      .then(m => m.ServicesComponent),
  data: {
    seo: {
      title: 'Interior Design & Construction Services | Dream2Decor',
      description: 'Explore Dream2Decor services, including interior design, modular kitchens, wardrobes, construction, and home renovation.'
    }
  }
},

  {
    path: 'footer',
    loadComponent: () =>
      import('./core/footer/footer.component')
        .then(m => m.FooterComponent),
    data: {
      seo: {
        title: 'Dream2Decor',
        description: 'Dream2Decor interior design and construction.',
        robots: 'noindex,follow'
      }
    }
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./core/contact/contact.component')
        .then(m => m.ContactComponent),
    data: {
      seo: {
        title: 'Contact Dream2Decor | Interior Design Consultation',
        description: 'Contact Dream2Decor to discuss your home interior design, construction, renovation, or modular kitchen project.'
      }
    }
  }
];
