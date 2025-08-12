import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let notification of notifications"
        class="toast-notification transform transition-all duration-300 ease-in-out"
        [ngClass]="{
          'bg-green-50 border-green-200': notification.type === 'success',
          'bg-red-50 border-red-200': notification.type === 'error',
          'bg-yellow-50 border-yellow-200': notification.type === 'warning',
          'bg-blue-50 border-blue-200': notification.type === 'info'
        }"
      >
        <div class="flex items-center p-4 rounded-lg border shadow-lg max-w-sm">
          <!-- Icono -->
          <div class="flex-shrink-0 mr-3">
            <svg
              *ngIf="notification.type === 'success'"
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg
              *ngIf="notification.type === 'error'"
              class="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg
              *ngIf="notification.type === 'warning'"
              class="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg
              *ngIf="notification.type === 'info'"
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Mensaje -->
          <div class="flex-1">
            <p
              class="text-sm font-medium"
              [ngClass]="{
                'text-green-800': notification.type === 'success',
                'text-red-800': notification.type === 'error',
                'text-yellow-800': notification.type === 'warning',
                'text-blue-800': notification.type === 'info'
              }"
            >
              {{ notification.message }}
            </p>
          </div>

          <!-- Botón cerrar -->
          <button
            type="button"
            class="ml-3 flex-shrink-0 rounded-md p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            [ngClass]="{
              'text-green-400 hover:text-green-600 focus:ring-green-500': notification.type === 'success',
              'text-red-400 hover:text-red-600 focus:ring-red-500': notification.type === 'error',
              'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500': notification.type === 'warning',
              'text-blue-400 hover:text-blue-600 focus:ring-blue-500': notification.type === 'info'
            }"
            (click)="removeNotification(notification.id)"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-notification {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-notification.removing {
      animation: slideOut 0.3s ease-in;
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `]
})
export class ToastNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }
}
