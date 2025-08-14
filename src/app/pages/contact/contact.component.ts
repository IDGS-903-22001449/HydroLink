import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { ContactService, ContactForm } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NavbarComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: ContactForm = {
    Name: '',
    Email: '',
    Subject: '',
    Message: ''
  };

  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  constructor(private contactService: ContactService) {}

  onSubmit() {
    if (!this.isFormValid()) {
      this.submitMessage = 'Por favor, completa todos los campos requeridos.';
      this.submitSuccess = false;
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';

    this.contactService.sendContactForm(this.contactForm).subscribe({
      next: (response) => {
        this.submitMessage = 'Mensaje enviado correctamente. Te contactaremos pronto.';
        this.submitSuccess = true;
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al enviar el mensaje:', error);
        this.submitMessage = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
        this.submitSuccess = false;
        this.isSubmitting = false;
      }
    });
  }

  isFormValid(): boolean {
    return this.contactForm.Name.trim() !== '' &&
           this.contactForm.Email.trim() !== '' &&
           this.contactForm.Subject.trim() !== '' &&
           this.contactForm.Message.trim() !== '';
  }

  resetForm() {
    this.contactForm = {
      Name: '',
      Email: '',
      Subject: '',
      Message: ''
    };
  }
}

