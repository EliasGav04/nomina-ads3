import { Component, OnInit } from '@angular/core';
import {
  ReporteArea,
  ReportePeriodo,
  ReporteResponse,
  ReportesService,
  TipoReporte
} from '../../services/reportes.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  tiposReporte: Array<{ id: TipoReporte; label: string }> = [
    { id: 'planilla_general', label: 'Planilla General del Período' },
    { id: 'nomina_por_area', label: 'Nómina por Área' },
    { id: 'anual_general', label: 'Consolidado Anual de Nómina' }
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

  private getTipoLabel(tipo: TipoReporte): string {
    return this.tiposReporte.find(t => t.id === tipo)?.label || 'Reporte';
  }

  private getTableForExport(r: ReporteResponse): { headers: string[]; rows: (string | number)[][] } {
    if (r.tipo === 'planilla_general') {
      return {
        headers: ['Código', 'Nombre del Empleado', 'Salario Base', 'Ingresos', 'Deducciones', 'Neto a Pagar'],
        rows: r.rows.map((it: any) => [
          it.codigo,
          it.nombre_empleado,
          Number(it.salario_base || 0),
          Number(it.ingresos || 0),
          Number(it.deducciones || 0),
          Number(it.neto || 0)
        ])
      };
    }

    if (r.tipo === 'nomina_por_area') {
      return {
        headers: ['Área', 'Empleados', 'Salario Base', 'Ingresos', 'Deducciones', 'Neto de Área'],
        rows: r.rows.map((it: any) => [
          it.area,
          Number(it.empleados || 0),
          Number(it.salario_base || 0),
          Number(it.ingresos || 0),
          Number(it.deducciones || 0),
          Number(it.neto || 0)
        ])
      };
    }

    return {
      headers: ['Período', 'Registros', 'Salario Base', 'Ingresos', 'Deducciones', 'Neto'],
      rows: r.rows.map((it: any) => [
        it.periodo,
        Number(it.empleados || 0),
        Number(it.salario_base || 0),
        Number(it.ingresos || 0),
        Number(it.deducciones || 0),
        Number(it.neto || 0)
      ])
    };
  }

  exportarPdf(): void {
    if (!this.reporte) {
      this.error = 'Primero genere un reporte para exportar.';
      return;
    }

    const r = this.reporte;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    let y = 14;

    // Encabezado de empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
      r.empresa?.razon_social || r.empresa?.nombre || '[RAZÓN SOCIAL DE LA EMPRESA]',
      margin + ((contentWidth * 0.66) / 2),
      y + 4,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const l1 = `RTN ${r.empresa?.rtn || 'N/A'} - Tel. ${r.empresa?.telefono || 'N/A'}`;
    const l2 = r.empresa?.direccion || 'N/A';
    const l3 = `${r.empresa?.correo || 'N/A'} - ${r.empresa?.sitio_web || 'N/A'}`;
    doc.text(l1, margin + ((contentWidth * 0.66) / 2), y + 10, { align: 'center' });
    doc.text(l2, margin + ((contentWidth * 0.66) / 2), y + 15, { align: 'center' });
    doc.text(l3, margin + ((contentWidth * 0.66) / 2), y + 20, { align: 'center' });

    if (r.empresa?.logoBase64) {
      const format = r.empresa.logoBase64.includes('image/png') ? 'PNG' : 'JPEG';
      const imgProps = doc.getImageProperties(r.empresa.logoBase64);
      const boxW = 42;
      const boxH = 24;
      const ratio = imgProps.width / imgProps.height;
      let drawW = boxW;
      let drawH = drawW / ratio;

      if (drawH > boxH) {
        drawH = boxH;
        drawW = drawH * ratio;
      }

      const x = margin + contentWidth - 48 + (boxW - drawW) / 2;
      const yImg = y + (boxH - drawH) / 2;
      doc.addImage(r.empresa.logoBase64, format, x, yImg, drawW, drawH);
    }

    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`REPORTE ${this.getTipoLabel(r.tipo).toUpperCase()}`, pageWidth / 2, y, { align: 'center' });

    y += 6;
    doc.setDrawColor(190);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Período:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(r.meta.periodo, margin + 15, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Área:', margin + contentWidth / 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(r.meta.area, margin + contentWidth / 2 + 10, y);

    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Empleados:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(r.meta.total_empleados), margin + 30, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha Generación Reporte:', margin + contentWidth / 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(r.meta.fecha_generacion).toLocaleDateString(), margin + contentWidth / 2 + 45, y);

    y += 6;
    const { headers, rows } = this.getTableForExport(r);
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: rows.map(row =>
        row.map((cell, idx) => {
          if (typeof cell === 'number' && idx >= headers.length - 4) return cell.toFixed(2);
          if (typeof cell === 'number' && (headers[idx] === 'Empleados' || headers[idx] === 'Registros')) return `${cell}`;
          return `${cell}`;
        })
      ),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [42, 42, 42] },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, textColor: [30, 30, 30] },
      columnStyles: {
        [headers.length - 1]: { halign: 'right' },
        [headers.length - 2]: { halign: 'right' },
        [headers.length - 3]: { halign: 'right' },
        [headers.length - 4]: { halign: 'right' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    const boxW = 86;
    const boxX = margin + contentWidth - boxW;
    doc.setDrawColor(190);
    doc.roundedRect(boxX, y, boxW, 28, 2, 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Total Salario Base:', boxX + 3, y + 6);
    doc.text(`L ${Number(r.resumen.salario_base || 0).toFixed(2)}`, boxX + boxW - 3, y + 6, { align: 'right' });
    doc.text('Total Ingresos:', boxX + 3, y + 11);
    doc.text(`L ${Number(r.resumen.ingresos || 0).toFixed(2)}`, boxX + boxW - 3, y + 11, { align: 'right' });
    doc.text('Total Deducciones:', boxX + 3, y + 16);
    doc.text(`L ${Number(r.resumen.deducciones || 0).toFixed(2)}`, boxX + boxW - 3, y + 16, { align: 'right' });

    doc.setDrawColor(212, 222, 237);
    doc.line(boxX + 2, y + 19, boxX + boxW - 2, y + 19);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Neto:', boxX + 3, y + 25);
    doc.text(`L ${Number(r.resumen.neto || 0).toFixed(2)}`, boxX + boxW - 3, y + 25, { align: 'right' });

    const base = this.getTipoLabel(r.tipo).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').toLowerCase();
    const periodo = (r.meta.periodo || 'periodo').normalize('NFD').replace(/[\u0300-\u036f]/g, '') .replace(/\s+/g, '_').toLowerCase();
    doc.save(`reporte_${base}_${periodo}.pdf`);
  }

  exportarExcel(): void {
    if (!this.reporte) {
      this.error = 'Primero genere un reporte para exportar.';
      return;
    }

    const r = this.reporte;
    const { headers, rows } = this.getTableForExport(r);
    const wb = XLSX.utils.book_new();

    const aoa: any[][] = [];
    aoa.push([this.getTipoLabel(r.tipo)]);
    aoa.push([]);
    aoa.push(['Período', r.meta.periodo, 'Área', r.meta.area]);
    aoa.push(['Total Empleados', r.meta.total_empleados, 'Fecha Generación Reporte', new Date(r.meta.fecha_generacion).toLocaleDateString()]);
    aoa.push([]);
    aoa.push(headers);
    rows.forEach(row => aoa.push(row));
    aoa.push([]);
    aoa.push(['Total Salario Base', Number(r.resumen.salario_base || 0)]);
    aoa.push(['Total Ingresos', Number(r.resumen.ingresos || 0)]);
    aoa.push(['Total Deducciones', Number(r.resumen.deducciones || 0)]);
    aoa.push(['Total Neto', Number(r.resumen.neto || 0)]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = headers.map((h, idx) => ({ wch: idx === 1 ? 28 : 16 }));
    XLSX.utils.book_append_sheet(wb, ws, 'reporte');

    const base = this.getTipoLabel(r.tipo).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').toLowerCase();
    const periodo = (r.meta.periodo || 'periodo').normalize('NFD').replace(/[\u0300-\u036f]/g, '') .replace(/\s+/g, '_').toLowerCase();
    XLSX.writeFile(wb, `reporte_${base}_${periodo}.xlsx`);
  }
}
