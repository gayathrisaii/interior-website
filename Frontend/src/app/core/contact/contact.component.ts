import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      message: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  submit() {
    if (this.contactForm.invalid || this.submitting) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post<{ message: string }>('/api/contact', this.contactForm.getRawValue())
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = response.message;
          this.contactForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting = false;
          const message: unknown = error.error?.message;
          this.errorMessage = typeof message === 'string'
            ? message
            : 'We could not send your message. Please try again.';
        }
      });
  }
}
