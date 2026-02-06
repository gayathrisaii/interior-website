import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { TestimonialComponent } from '../testimonial/testimonial.component';
import { FeatureComponent } from '../feature/feature.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FooterComponent,HeaderComponent,HeroComponent,TestimonialComponent,FeatureComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
 
}
