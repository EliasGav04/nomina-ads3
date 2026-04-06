import { Component, OnInit } from '@angular/core';
import { SessionExpirationModalService } from './services/session-expiration-modal.service';
import { Router } from '@angular/router';
import { InfoempresaService } from './services/infoempresa.service';
import { CurrencyConfigService } from './services/currency-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  modalVisible = false;
  modalMessage = 'Tu sesión ha expirado. Inicia sesión nuevamente.';

  constructor(
    private sessionExpirationModal: SessionExpirationModalService,
    private router: Router,
    private infoempresaService: InfoempresaService,
    private currencyConfig: CurrencyConfigService
  ) {
    this.sessionExpirationModal.visible$.subscribe((visible) => {
      this.modalVisible = visible;
    });

    this.sessionExpirationModal.message$.subscribe((message) => {
      this.modalMessage = message;
    });
  }

  ngOnInit(): void {
    this.infoempresaService.getById(1).subscribe({
      next: (empresa) => this.currencyConfig.setCurrencyCode(empresa?.codigo_moneda || 'HNL'),
      error: () => this.currencyConfig.setCurrencyCode('HNL')
    });
  }

  closeSessionModal(): void {
    this.sessionExpirationModal.close();
    this.router.navigate(['/login']);
  }
}
