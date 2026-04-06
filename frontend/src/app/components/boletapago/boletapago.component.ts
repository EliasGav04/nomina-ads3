import { Component, OnInit } from '@angular/core';
import {
  BoletaResponse,
  BoletapagoService,
  FiltroEmpleado,
  FiltroPeriodo
} from '../../services/boletapago.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateDMY } from '../../utils/date.utils';
import { CurrencyConfigService } from '../../services/currency-config.service';

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
  formatDateDMY = formatDateDMY;
  constructor(
    private boletaPagoService: BoletapagoService,
    private currencyConfig: CurrencyConfigService
  ) {}

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
        this.empleados = [];
        this.periodos = [];
        this.idEmpleado = null;
        this.idPeriodo = null;
        this.boleta = null;
        this.loading = false;
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
    const fechaInicio = this.boleta?.periodo?.fecha_inicio || this.periodoSeleccionado?.fecha_inicio;
    const fechaFinal = this.boleta?.periodo?.fecha_final || this.periodoSeleccionado?.fecha_final;
    if (!fechaInicio || !fechaFinal) return 0;
    const ini = new Date(fechaInicio);
    const fin = new Date(fechaFinal);
    const ms = fin.getTime() - ini.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  }

  get currencyCode(): string {
    return this.boleta?.empresa?.codigo_moneda || this.currencyConfig.getCurrencyCode();
  }

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol(this.currencyCode);
  }

  private formatMoney(value: number): string {
    return this.currencyConfig.formatAmount(value, this.currencyCode);
  }

  descargarPdf(): void {
    if (!this.boleta) {
      this.error = 'Primero busque una boleta para descargar en PDF.';
      return;
    }

    const b = this.boleta;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const fontFamily = 'helvetica';

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // Encabezado empresa
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(13);
    doc.text(
      b.empresa?.razon_social || b.empresa?.nombre || '[RAZÓN SOCIAL DE LA EMPRESA]',
      margin + ((contentWidth * 0.66) / 2),
      y + 4,
      { align: 'center' }
    );

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(9.5);
    const l1 = `RTN ${b.empresa?.rtn || 'N/A'} - Tel. ${b.empresa?.telefono || 'N/A'}`;
    const l2 = b.empresa?.direccion || 'N/A';
    const l3 = `${b.empresa?.correo || 'N/A'} - ${b.empresa?.sitio_web || 'N/A'}`;
    doc.text(l1, margin + ((contentWidth * 0.66) / 2), y + 10, { align: 'center' });
    doc.text(l2, margin + ((contentWidth * 0.66) / 2), y + 15, { align: 'center' });
    doc.text(l3, margin + ((contentWidth * 0.66) / 2), y + 20, { align: 'center' });

    if (b.empresa?.logoBase64) {
      const format = b.empresa.logoBase64.includes('image/png') ? 'PNG' : 'JPEG';
      const imgProps = doc.getImageProperties(b.empresa.logoBase64);
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
      doc.addImage(b.empresa.logoBase64, format, x, yImg, drawW, drawH);
    }

    y += 30;
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(12);
    doc.text(`BOLETA DE PAGO - PERÍODO ${b.periodo.periodo.toUpperCase()}`, pageWidth / 2, y, {
      align: 'center'
    });

    y += 6;
    doc.setDrawColor(190);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    // Datos período y empleado
    const leftX = margin;
    const rightX = margin + contentWidth / 2 + 2;
    const blockW = contentWidth / 2 - 4;

    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('DATOS DEL PERÍODO', leftX, y);
    doc.text('DATOS DEL EMPLEADO', rightX, y);

    doc.setFontSize(9.5);
    const periodoRows: Array<[string, string]> = [
      ['Período:', `${formatDateDMY(b.periodo.fecha_inicio)} - ${formatDateDMY(b.periodo.fecha_final)}`],
      ['Fecha Pago:', `${formatDateDMY(b.periodo.fecha_pago)}`],
      ['Días Trabajados:', `${this.diasPeriodo}`]
    ];
    const empleadoRows: Array<[string, string]> = [
      ['ID:', `${b.empleado.id_empleado}`],
      ['Empleado:', b.empleado.nombre_completo],
      ['DNI:', b.empleado.dni],
      ['Cargo:', b.empleado.cargo],
      ['Área:', b.empleado.area || 'Sin área'],
      ['IHSS:', b.empleado.numero_ihss || 'N/A'],
      ['Cuenta bancaria:', b.empleado.cta_bancaria || 'N/A']
    ];

    const lineStep = 5;
    let yPeriodo = y + 5;
    for (const row of periodoRows) {
    doc.setFont(fontFamily, 'bold');
      doc.text(row[0], leftX, yPeriodo);
      doc.setFont(fontFamily, 'normal');
      doc.text(row[1], leftX + 28, yPeriodo);
      yPeriodo += lineStep;
    }

    let yEmpleado = y + 5;
    for (const row of empleadoRows) {
      doc.setFont(fontFamily, 'bold');
      doc.text(row[0], rightX, yEmpleado);
      doc.setFont(fontFamily, 'normal');
      doc.text(row[1], rightX + 32, yEmpleado, { maxWidth: blockW - 32 });
      yEmpleado += lineStep;
    }

    y = Math.max(yPeriodo, yEmpleado) + 2;
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Tabla ingresos
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(11);
    doc.text('INGRESOS', margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Concepto', `Valor (${this.currencySymbol})`]],
      body: b.ingresos.map(i => [i.concepto, this.formatMoney(i.monto || 0)]),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [42, 42, 42] },
      styles: { font: fontFamily, fontSize: 9, cellPadding: 2.2 },
      columnStyles: { 1: { halign: 'right' } }
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    // Tabla deducciones
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(11);
    doc.text('DEDUCCIONES', margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Concepto', `Valor (${this.currencySymbol})`]],
      body: b.deducciones.map(d => [d.concepto, this.formatMoney(d.monto || 0)]),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [42, 42, 42] },
      styles: { font: fontFamily, fontSize: 9, cellPadding: 2.2 },
      columnStyles: { 1: { halign: 'right' } }
    });

    y = (doc as any).lastAutoTable.finalY + 7;

    // Resumen
    const boxW = 78;
    const boxX = margin + contentWidth - boxW;
    doc.setDrawColor(190);
    doc.roundedRect(boxX, y, boxW, 25, 2, 2);

    doc.setFontSize(9.5);
    doc.setFont(fontFamily, 'normal');
    doc.text('Total Ingresos:', boxX + 3, y + 6);
    doc.text(this.formatMoney(b.resumen.total_ingresos), boxX + boxW - 3, y + 6, { align: 'right' });
    doc.text('Total Deducciones:', boxX + 3, y + 11);
    doc.text(this.formatMoney(b.resumen.total_deducciones), boxX + boxW - 3, y + 11, { align: 'right' });

    doc.setDrawColor(212, 222, 237);
    doc.line(boxX + 2, y + 14, boxX + boxW - 2, y + 14);
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(11.5);
    doc.text('Salario Neto:', boxX + 3, y + 20);
    doc.text(this.formatMoney(b.resumen.salario_neto), boxX + boxW - 3, y + 20, { align: 'right' });

    const empleadoName = (b.empleado.nombre_completo || 'empleado').replace(/\s+/g, '_');
    const periodoName = (b.periodo.periodo || 'periodo').replace(/\s+/g, '_');
    doc.save(`boleta_${empleadoName}_${periodoName}.pdf`);
  }
}
