import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly document = inject(DOCUMENT);

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateSeoMetadata());

    this.updateSeoMetadata();
  }

  private updateSeoMetadata(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const seo = route.data['seo'] as
      | { title: string; description: string; robots?: string }
      | undefined;
    const title = seo?.title ?? 'Dream2Decor | Interior Design & Construction';
    const description = seo?.description
      ?? 'Dream2Decor creates elegant home interiors, modular kitchens, custom wardrobes, and construction solutions.';
    const path = this.router.url.split(/[?#]/, 1)[0] || '/';
    const canonicalUrl = `https://dream2decor.in${path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`}`;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({
      name: 'robots',
      content: seo?.robots ?? 'index,follow'
    });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }
}
