import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConceptosService } from '../../services/conceptos.service';
import { Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyConfigService } from '../../services/currency-config.service';

type TramoIsr = { desde: string; hasta: string; tasa: string };

@Component({
  selector: 'app-conceptos',
  templateUrl: './conceptos.component.html',
  styleUrls: ['./conceptos.component.css']
})
export class ConceptosComponent implements OnInit {

  conceptos: Concepto[] = [];
  conceptoForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;
  private readonly conceptoPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
  filtroTexto = '';
  filtroTipo: 'Todos' | 'ingreso' | 'deduccion' = 'Todos';
  filtroNaturaleza: 'Todos' | 'fijo' | 'porcentaje' | 'manual' = 'Todos';
  filtroEstado: 'Todos' | 'Activo' | 'Inactivo' = 'Todos';

  tipoLabels: { [key: string]: string } = {
    ingreso: 'Ingreso',
    deduccion: 'Deducción'
  };

  naturalezaLabels: { [key: string]: string } = {
    fijo: 'Fijo',
    porcentaje: 'Porcentaje',
    manual: 'Manual'
  };
  tramosIsr: TramoIsr[] = [];

  constructor(
    private conceptosService: ConceptosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private currencyConfig: CurrencyConfigService
  ) {
    this.conceptoForm = this.fb.group({
      concepto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(this.conceptoPattern)]],
      tipo: ['ingreso', [Validators.required]],
      naturaleza: ['fijo', [Validators.required]],
      regla_calculo: ['normal', [Validators.required]],
      valor_defecto: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      aplica_tope: [false],
      tope_monto: [null],
      tramos_json: [null],
      es_global: [false],
      estado: ['Activo']
    });

    this.conceptoForm.get('naturaleza')?.valueChanges.subscribe(() => this.applyValorValidators());
    this.conceptoForm.get('tipo')?.valueChanges.subscribe(() => this.applyTopeValidators());
    this.conceptoForm.get('naturaleza')?.valueChanges.subscribe(() => this.applyTopeValidators());
    this.conceptoForm.get('aplica_tope')?.valueChanges.subscribe(() => this.applyTopeValidators());
    this.conceptoForm.get('regla_calculo')?.valueChanges.subscribe(() => this.applyReglaCalculoValidators());
  }

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol();
  }

  ngOnInit(): void {
    this.loadConceptos();
  }

  loadConceptos(): void {
    this.conceptosService.getAll().subscribe(data => this.conceptos = data);
  }

  get conceptosFiltrados(): Concepto[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return this.conceptos.filter((c) => {
      const coincideTexto = !texto || [
        String(c.id_concepto || ''),
        (c.concepto || ''),
        (this.tipoLabels[c.tipo] || ''),
        (this.naturalezaLabels[c.naturaleza] || ''),
        (c.estado || '')
      ].some(v => v.toLowerCase().includes(texto));
      const coincideTipo = this.filtroTipo === 'Todos' || c.tipo === this.filtroTipo;
      const coincideNaturaleza = this.filtroNaturaleza === 'Todos' || c.naturaleza === this.filtroNaturaleza;
      const coincideEstado = this.filtroEstado === 'Todos' || c.estado === this.filtroEstado;
      return coincideTexto && coincideTipo && coincideNaturaleza && coincideEstado;
    });
  }

  clearFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipo = 'Todos';
    this.filtroNaturaleza = 'Todos';
    this.filtroEstado = 'Todos';
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.conceptoForm.reset({ tipo: 'ingreso', naturaleza: 'fijo', regla_calculo: 'normal', valor_defecto: 0, aplica_tope: false, tope_monto: null, tramos_json: null, es_global: false, estado: 'Activo' });
    this.tramosIsr = [];
    this.applyValorValidators();
    this.applyTopeValidators();
    this.applyReglaCalculoValidators();
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveConcepto(): void {
    if (this.conceptoForm.invalid) {
      this.conceptoForm.markAllAsTouched();
      this.showToast('Complete correctamente los campos del concepto', 'bg-primary');
      return;
    }

    const raw = this.conceptoForm.getRawValue();
    const data: any = { ...raw, estado: 'Activo' };
    if (this.isTramosRule) {
      const tramosNormalizados = this.validarYConstruirTramos();
      if (!tramosNormalizados) {
        return;
      }
      data.regla_calculo = 'tramos';
      data.aplica_tope = false;
      data.tope_monto = null;
      data.tramos_json = JSON.stringify(tramosNormalizados);
    } else {
      data.regla_calculo = 'normal';
      data.tramos_json = null;
    }
  
    if (this.editing && this.selectedId) {
      this.conceptosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Concepto actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadConceptos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar concepto', 'bg-primary')
      });
    } else {
      this.conceptosService.create(data).subscribe({
        next: () => {
          this.showToast('Concepto creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadConceptos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear concepto', 'bg-primary')
      });
    }
  }

  editConcepto(concepto: Concepto, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = concepto.id_concepto;
    this.tramosIsr = this.parseTramosParaFormulario(concepto.tramos_json);
    this.conceptoForm.patchValue({
      ...concepto,
      regla_calculo: concepto.regla_calculo || 'normal',
      aplica_tope: !!concepto.aplica_tope,
      tope_monto: concepto.tope_monto
    });
    this.applyValorValidators();
    this.applyTopeValidators();
    this.applyReglaCalculoValidators();
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteConcepto(id: number): void {
    this.conceptosService.delete(id).subscribe({
      next: () => {
        this.showToast('Concepto inactivado correctamente', 'bg-danger');
        this.loadConceptos();
      },
      error: () => this.showToast('Error al inactivar concepto', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  get isPorcentaje(): boolean {
    return this.conceptoForm.get('naturaleza')?.value === 'porcentaje';
  }

  get isDeduccion(): boolean {
    return this.conceptoForm.get('tipo')?.value === 'deduccion';
  }

  get canUseTope(): boolean {
    return !this.isTramosRule && this.isDeduccion && this.isPorcentaje;
  }

  get isTramosRule(): boolean {
    return this.conceptoForm.get('regla_calculo')?.value === 'tramos';
  }

  get showTramosRuleTable(): boolean {
    return this.isTramosRule;
  }

  getReglaResumen(c: Concepto): string {
    if (c.regla_calculo === 'tramos') return 'Cálculo por tramos';
    if (c.aplica_tope && c.tope_monto !== null) return `Tope: ${this.currencySymbol} ${Number(c.tope_monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return 'No aplica';
  }

  onConceptoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    if (filtered !== input.value) {
      input.value = filtered;
      this.conceptoForm.get('concepto')?.setValue(filtered, { emitEvent: false });
    }
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const current = input.value;
    if (this.isPorcentaje) {
      const normalizedRaw = current
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      const match = normalizedRaw.match(/^(\d+)(\.(\d{0,2})?)?/);
      const limited = match ? `${match[1]}${match[2] || ''}` : '';
      const parsed = Number(limited);
      const normalized = limited === '' ? '' : String(Number.isFinite(parsed) ? Math.min(parsed, 100) : '');
      if (normalized !== current) {
        input.value = normalized;
        this.conceptoForm.get('valor_defecto')?.setValue(normalized, { emitEvent: false });
      }
      return;
    }

    const normalized = current.replace(/[^0-9.]/g, '');
    if (normalized !== current) {
      input.value = normalized;
      this.conceptoForm.get('valor_defecto')?.setValue(normalized, { emitEvent: false });
    }
  }

  onTopeMontoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (normalized !== input.value) {
      input.value = normalized;
      this.conceptoForm.get('tope_monto')?.setValue(normalized, { emitEvent: false });
    }
  }

  onTramoInput(index: number, campo: 'desde' | 'hasta' | 'tasa', event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    this.tramosIsr[index][campo] = normalized;
    if (normalized !== input.value) input.value = normalized;
  }

  addTramo(): void {
    this.tramosIsr.push({ desde: '', hasta: '', tasa: '' });
  }

  removeTramo(index: number): void {
    if (this.tramosIsr.length <= 1) return;
    this.tramosIsr.splice(index, 1);
  }

  isInvalid(controlName: string): boolean {
    const control = this.conceptoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private applyValorValidators(): void {
    const valorControl = this.conceptoForm.get('valor_defecto');
    if (!valorControl) return;

    if (this.isPorcentaje) {
      valorControl.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]);
    } else {
      valorControl.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(1000000)
      ]);
    }
    valorControl.updateValueAndValidity({ emitEvent: false });
  }

  private applyTopeValidators(): void {
    const aplicaTopeControl = this.conceptoForm.get('aplica_tope');
    const topeControl = this.conceptoForm.get('tope_monto');
    if (!aplicaTopeControl || !topeControl) return;

    if (!this.canUseTope) {
      if (aplicaTopeControl.value) {
        aplicaTopeControl.setValue(false, { emitEvent: false });
      }
      topeControl.setValue(null, { emitEvent: false });
      topeControl.clearValidators();
      topeControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const aplicaTope = !!aplicaTopeControl.value;
    if (aplicaTope) {
      topeControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(1000000)
      ]);
    } else {
      topeControl.setValue(null, { emitEvent: false });
      topeControl.clearValidators();
    }

    topeControl.updateValueAndValidity({ emitEvent: false });
  }

  private applyReglaCalculoValidators(): void {
    const aplicaTopeControl = this.conceptoForm.get('aplica_tope');
    const topeControl = this.conceptoForm.get('tope_monto');
    if (!aplicaTopeControl || !topeControl) return;

    if (this.isTramosRule) {
      aplicaTopeControl.setValue(false, { emitEvent: false });
      topeControl.setValue(null, { emitEvent: false });
      if (!this.tramosIsr.length) this.addTramo();
    } else {
      this.tramosIsr = [];
    }

    this.applyValorValidators();
    this.applyTopeValidators();
  }

  private parseTramosParaFormulario(tramosJson: string | null): TramoIsr[] {
    if (!tramosJson) return [];
    try {
      const parsed = JSON.parse(tramosJson);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((t: any) => ({
        desde: t?.desde != null ? String(t.desde) : '',
        hasta: t?.hasta != null ? String(t.hasta) : '',
        tasa: t?.tasa != null ? String(t.tasa) : ''
      }));
    } catch (_) {
      return [];
    }
  }

  private validarYConstruirTramos(): Array<{ desde: number; hasta: number | null; tasa: number }> | null {
    const mensaje = 'Revise los valores ingresados en los tramos.';

    if (!this.tramosIsr.length) {
      this.showToast(mensaje, 'bg-primary');
      return null;
    }

    const numeroRegex = /^\d+(\.\d{1,2})?$/;
    const normalizados: Array<{ desde: number; hasta: number | null; tasa: number }> = [];

    for (let i = 0; i < this.tramosIsr.length; i++) {
      const tramo = this.tramosIsr[i];
      const fila = i + 1;
      const desdeRaw = (tramo.desde || '').trim();
      const hastaRaw = (tramo.hasta || '').trim();
      const tasaRaw = (tramo.tasa || '').trim();

      if (!numeroRegex.test(desdeRaw)) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
      if (!numeroRegex.test(tasaRaw)) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
      if (hastaRaw && !numeroRegex.test(hastaRaw)) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }

      const desde = Number(desdeRaw);
      const tasa = Number(tasaRaw);
      const hasta = hastaRaw ? Number(hastaRaw) : null;

      if (desde < 0) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
      if (tasa < 0 || tasa > 100) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
      if (hasta !== null && hasta <= desde) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }

      normalizados.push({ desde, hasta, tasa });
    }

    normalizados.sort((a, b) => a.desde - b.desde);
    for (let i = 1; i < normalizados.length; i++) {
      const prev = normalizados[i - 1];
      const curr = normalizados[i];
      if (prev.hasta === null) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
      if (curr.desde < prev.hasta) {
        this.showToast(mensaje, 'bg-primary');
        return null;
      }
    }

    return normalizados;
  }
}
