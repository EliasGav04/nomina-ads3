import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConceptosService } from '../../services/conceptos.service';
import { Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyConfigService } from '../../services/currency-config.service';

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

  tipoLabels: { [key: string]: string } = {
    ingreso: 'Ingreso',
    deduccion: 'Deducción'
  };

  naturalezaLabels: { [key: string]: string } = {
    fijo: 'Fijo',
    porcentaje: 'Porcentaje',
    manual: 'Manual'
  };

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
      valor_defecto: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      es_global: [false],
      estado: ['Activo']
    });

    this.conceptoForm.get('naturaleza')?.valueChanges.subscribe(() => this.applyValorValidators());
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

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.conceptoForm.reset({ tipo: 'ingreso', naturaleza: 'fijo', valor_defecto: 0, es_global: false, estado: 'Activo' });
    this.applyValorValidators();
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveConcepto(): void {
    if (this.conceptoForm.invalid) {
      this.conceptoForm.markAllAsTouched();
      this.showToast('Complete correctamente los campos del concepto', 'bg-primary');
      return;
    }

    const data = { ...this.conceptoForm.value, estado: 'Activo' };
  
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
    this.conceptoForm.patchValue(concepto);
    this.applyValorValidators();
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
}
