import { Component } from '@angular/core';
import { SessionExpirationModalService } from './services/session-expiration-modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  modalVisible = false;
  modalMessage = 'Tu sesión ha expirado. Inicia sesión nuevamente.';

  constructor(
    private sessionExpirationModal: SessionExpirationModalService,
    private router: Router
  ) {
    this.sessionExpirationModal.visible$.subscribe((visible) => {
      this.modalVisible = visible;
    });

    this.sessionExpirationModal.message$.subscribe((message) => {
      this.modalMessage = message;
    });
  }

  closeSessionModal(): void {
    this.sessionExpirationModal.close();
    this.router.navigate(['/login']);
  }
}
