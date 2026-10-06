import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('Dream2Decor');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Dream2Decor delivers elegant interior design, modular kitchens, wardrobes, and complete construction solutions for homes and commercial spaces.'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content:
        'interior design, home interiors, Dream2Decor, modular kitchen, wardrobe design, construction services'
    });
  }
}
