import { Component, OnInit } from '@angular/core';
import {
  BoletaResponse,
  BoletapagoService,
  FiltroEmpleado,
  FiltroPeriodo
} from '../../services/boletapago.service';

@Component({
  selector: 'app-boletapago',
  templateUrl: './boletapago.component.html',
  styleUrls: ['./boletapago.component.css']
})
export class BoletapagoComponent implements OnInit {
  empleados: FiltroEmpleado[] = [];
  periodos: FiltroPeriodo[] = [];
  idEmpleado: number | null = null;
  idPeriodo: number | null = null;
  boleta: BoletaResponse | null = null;
  loading = false;
  error = '';

  constructor(private boletaPagoService: BoletapagoService) {}

  ngOnInit(): void {
    this.cargarFiltros();
  }

  cargarFiltros(): void {
    this.boletaPagoService.getFiltros().subscribe({
      next: (r) => {
        this.empleados = r.empleados || [];
        this.periodos = r.periodos || [];
        this.idEmpleado = this.empleados.length ? this.empleados[0].id_empleado : null;
        this.idPeriodo = this.periodos.length ? this.periodos[0].id_periodo : null;
      },
      error: () => {
        this.error = 'No se pudieron cargar filtros de boleta.';
      }
    });
  }

  buscarBoleta(): void {
    if (!this.idEmpleado || !this.idPeriodo) {
      this.error = 'Seleccione empleado y período para continuar.';
      this.boleta = null;
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.boleta = null;

    this.boletaPagoService.getBoleta(this.idEmpleado, this.idPeriodo).subscribe({
      next: (r) => {
        this.boleta = r;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'No se pudo generar la vista de boleta.';
        this.loading = false;
      }
    });
  }

  get periodoSeleccionado(): FiltroPeriodo | null {
    return this.periodos.find(p => p.id_periodo === this.idPeriodo) || null;
  }

  get diasPeriodo(): number {
    if (!this.periodoSeleccionado?.fecha_inicio || !this.periodoSeleccionado?.fecha_final) return 0;
    const ini = new Date(this.periodoSeleccionado.fecha_inicio);
    const fin = new Date(this.periodoSeleccionado.fecha_final);
    const ms = fin.getTime() - ini.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  }
}
