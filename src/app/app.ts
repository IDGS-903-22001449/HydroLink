import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { ToastNotificationsComponent } from './components/toast-notifications/toast-notifications.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, ToastNotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'HydroLink';
}
