import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-contact',
  imports: [CommonModule,ReactiveFormsModule,MatCardModule,
MatInputModule,
MatButtonModule,
MatIconModule
],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
 animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ])
  ],
})
export class ContactComponent {
  contactForm: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      message: ['', Validators.required]
    });
  }

  submit() {
    if (this.contactForm.invalid) return;

    this.submitting = true;

    this.http.post('http://localhost:3000/api/contact', this.contactForm.value)
      .subscribe({
        next: () => {
          this.submitting = false;
          alert('Message sent successfully!');
          this.contactForm.reset();
        },
        error: () => {
          this.submitting = false;
          alert('Failed to send message');
        }
      });
  }
}
