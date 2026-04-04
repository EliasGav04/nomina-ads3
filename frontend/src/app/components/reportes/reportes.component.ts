import { Component, OnInit } from '@angular/core';
import {
  ReporteArea,
  ReportePeriodo,
  ReporteResponse,
  ReportesService,
  TipoReporte
} from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  tiposReporte: Array<{ id: TipoReporte; label: string }> = [
    { id: 'planilla_general', label: 'Planilla General del Período' },
    { id: 'nomina_por_area', label: 'Nómina por Área/Departamento' },
    { id: 'anual_general', label: 'Reporte General anual de nómina' }
  ];

  tipoSeleccionado: TipoReporte = 'planilla_general';
  idPeriodo: number | null = null;
  idArea: number | null = null;
  periodos: ReportePeriodo[] = [];
  areas: ReporteArea[] = [];
  reporte: ReporteResponse | null = null;
  loading = false;
  error = '';

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarConfig();
  }

  cargarConfig(): void {
    this.reportesService.getConfig().subscribe({
      next: (r) => {
        this.periodos = r.periodos || [];
        this.areas = r.areas || [];
        this.idPeriodo = this.periodos.length ? this.periodos[0].id_periodo : null;
      },
      error: () => {
        this.error = 'No se pudo cargar configuración de reportes.';
      }
    });
  }

  generarReporte(): void {
    if (!this.idPeriodo && this.tipoSeleccionado !== 'anual_general') {
      this.error = 'Seleccione período para generar el reporte.';
      this.reporte = null;
      return;
    }

    this.loading = true;
    this.error = '';
    this.reporte = null;
    this.reportesService.generar(this.tipoSeleccionado, this.idPeriodo, this.idArea).subscribe({
      next: (r) => {
        this.reporte = r;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'No se pudo generar el reporte.';
        this.loading = false;
      }
    });
  }
}
