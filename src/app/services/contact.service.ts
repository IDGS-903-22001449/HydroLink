import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactForm {
  Name: string;
  Email: string;
  Subject: string;
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:5000/api/Contact';

  constructor(private http: HttpClient) { }

  sendContactForm(contactForm: ContactForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, contactForm);
  }
}
