import { Component, OnInit } from '@angular/core';
import { DashboardResumen, DashboardService } from '../../services/dashboard.service';
import { CurrencyConfigService } from '../../services/currency-config.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  resumen: DashboardResumen = {
    total_empleados: 0,
    nomina_mes: 0,
    periodo_actual: null
  };

  nombreUsuario = 'Usuario';

  constructor(
    private dashboardService: DashboardService,
    private currencyConfig: CurrencyConfigService
  ) {}

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol();
  }

  ngOnInit(): void {
    this.cargarResumen();
    this.resolverNombreUsuario();
  }

  cargarResumen(): void {
    this.dashboardService.getResumen().subscribe({
      next: (data) => (this.resumen = data),
      error: () => {
        this.resumen = { total_empleados: 0, nomina_mes: 0, periodo_actual: null };
      }
    });
  }

  private resolverNombreUsuario(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const parts = token.split('.');
    if (parts.length < 2) return;
    try {
      const payload = JSON.parse(atob(parts[1]));
      this.nombreUsuario = payload?.usuario || payload?.username || payload?.name || this.nombreUsuario;
    } catch {
      //mantener usuario por defecto
    }
  }
}
