import { Component, OnInit, TemplateRef } from '@angular/core';
import { Area, Empleado, Periodo } from '../../interfaces/interface';
import { AreasService } from '../../services/areas.service';
import { EstadoNomina, NominaService } from '../../services/nomina.service';
import { CurrencyConfigService } from '../../services/currency-config.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nomina',
  templateUrl: './nomina.component.html',
  styleUrls: ['./nomina.component.css']
})
export class NominaComponent implements OnInit {
  periodosAbiertos: Periodo[] = [];
  areas: Area[] = [];
  empleados: Empleado[] = [];

  periodoSeleccionadoId: number | null = null;
  areaSeleccionadaId: number | null = null;
  detallePeriodo: Periodo | null = null;
  totalEmpleados = 0;
  ejecutando = false;
  private modalRef: NgbModalRef | null = null;
  modalTitle = '';
  modalMessage = '';

  estadoNomina: EstadoNomina = {
    estado: 'Pendiente de Cálculo',
    empleadosValidados: false,
    movimientosRegistrados: false,
    calculoPendiente: true,
    aprobacionPendiente: false
  };

  constructor(
    private nominaService: NominaService,
    private areasService: AreasService,
    private currencyConfig: CurrencyConfigService,
    private modalService: NgbModal
  ) {}

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol();
  }

  ngOnInit(): void {
    this.cargarPeriodosAbiertos();
    this.cargarAreas();
  }

  cargarPeriodosAbiertos(): void {
    this.nominaService.getPeriodosAbiertos().subscribe({
      next: (data) => {
        this.periodosAbiertos = data;
        this.periodoSeleccionadoId = data.length ? data[0].id_periodo : null;
        this.actualizarContextoPeriodo();
      },
      error: () => {
        this.periodosAbiertos = [];
        this.periodoSeleccionadoId = null;
        this.detallePeriodo = null;
      }
    });
  }

  cargarAreas(): void {
    this.areasService.getAll().subscribe({
      next: (data) => this.areas = data.filter(a => a.estado === 'Activo'),
      error: () => this.areas = []
    });
  }

  onPeriodoChange(): void {
    this.areaSeleccionadaId = null;
    this.actualizarContextoPeriodo();
  }

  actualizarContextoPeriodo(): void {
    if (!this.periodoSeleccionadoId) {
      this.detallePeriodo = null;
      this.empleados = [];
      this.totalEmpleados = 0;
      this.estadoNomina = {
        estado: 'Sin período abierto',
        empleadosValidados: false,
        movimientosRegistrados: false,
        calculoPendiente: false,
        aprobacionPendiente: false
      };
      return;
    }

    this.detallePeriodo =
      this.periodosAbiertos.find(p => p.id_periodo === this.periodoSeleccionadoId) || null;

    this.nominaService.getEstadoActual(this.periodoSeleccionadoId).subscribe({
      next: (estado) => this.estadoNomina = estado,
      error: () => {
        this.estadoNomina = {
          estado: 'Error',
          empleadosValidados: false,
          movimientosRegistrados: false,
          calculoPendiente: false,
          aprobacionPendiente: false
        };
      }
    });

    this.filtrarEmpleados();
  }

  filtrarEmpleados(): void {
    if (!this.periodoSeleccionadoId) return;
    this.nominaService.getEmpleadosProcesar(this.periodoSeleccionadoId, this.areaSeleccionadaId).subscribe({
      next: (r) => {
        this.empleados = r.empleados;
        this.totalEmpleados = r.total;
      },
      error: () => {
        this.empleados = [];
        this.totalEmpleados = 0;
      }
    });
  }

  ejecutarNomina(confirmTemplate: TemplateRef<any>, messageTemplate: TemplateRef<any>): void {
    if (!this.periodoSeleccionadoId) {
      this.showMessageModal(messageTemplate, 'Información', 'Seleccione un período abierto para ejecutar nómina.');
      return;
    }
    if (this.ejecutando) {
      this.showMessageModal(messageTemplate, 'Información', 'Ya hay una ejecución en curso. Espere a que finalice.');
      return;
    }

    this.modalRef = this.modalService.open(confirmTemplate, { backdrop: 'static' });
  }

  confirmarEjecucion(messageTemplate: TemplateRef<any>): void {
    if (!this.periodoSeleccionadoId || this.ejecutando) {
      this.modalRef?.close();
      return;
    }
    this.modalRef?.close();

    this.ejecutando = true;
    this.nominaService.ejecutarNomina(this.periodoSeleccionadoId).subscribe({
      next: (r) => {
        const message = r?.message || 'La nómina se ejecutó correctamente.';
        this.showMessageModal(messageTemplate, 'Proceso completado', message);
        this.ejecutando = false;
        this.cargarPeriodosAbiertos();
      },
      error: (err) => {
        this.showMessageModal(
          messageTemplate,
          'Error',
          err?.error?.error || 'Error al ejecutar nómina'
        );
        this.ejecutando = false;
      }
    });
  }

  private showMessageModal(template: TemplateRef<any>, title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalRef = this.modalService.open(template, { backdrop: 'static' });
  }
}
