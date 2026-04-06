import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpleadoConceptosService } from '../../services/empleado-conceptos.service';
import { EmpleadosService } from '../../services/empleados.service';
import { ConceptosService } from '../../services/conceptos.service';
import { EmpleadoConcepto, Empleado, Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyConfigService } from '../../services/currency-config.service';

@Component({
  selector: 'app-empleado-conceptos',
  templateUrl: './empleado-conceptos.component.html',
  styleUrls: ['./empleado-conceptos.component.css']
})
export class EmpleadoConceptosComponent implements OnInit {

  asignaciones: EmpleadoConcepto[] = [];
  empleados: Empleado[] = [];
  conceptos: Concepto[] = [];

  asignacionForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  constructor(
    private empleadoConceptosService: EmpleadoConceptosService,
    private empleadosService: EmpleadosService,
    private conceptosService: ConceptosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private currencyConfig: CurrencyConfigService
  ) {
    this.asignacionForm = this.fb.group({
      id_empleado: [null, [Validators.required]],
      id_concepto: [null, [Validators.required]],
      valor: [0, [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      fecha_desde: ['', [Validators.required]],
      fecha_hasta: ['']
    });
  }

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol();
  }

  ngOnInit(): void {
    this.loadAsignaciones();
    this.loadEmpleados();
    this.loadConceptos();
  }

  loadAsignaciones(): void {
    this.empleadoConceptosService.getAll().subscribe(data => this.asignaciones = data);
  }

  loadEmpleados(): void {
    this.empleadosService.getAll().subscribe(data => this.empleados = data);
  }

  loadConceptos(): void {
    this.conceptosService.getAll().subscribe(data => {

      //fijo y porcentaje
      this.conceptos = data.filter(c => c.naturaleza === 'fijo' || c.naturaleza === 'porcentaje');
    });
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.asignacionForm.reset({ valor: 0 });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveAsignacion(): void {
    if (this.asignacionForm.invalid) {
      this.asignacionForm.markAllAsTouched();
      this.showToast('Complete todos los campos obligatorios y verifique el valor', 'bg-primary');
      return;
    }

    const data = { ...this.asignacionForm.value };

    if (Number(data.valor) === 0) {
      this.showToast('El valor debe ser diferente de 0', 'bg-primary');
      return;
    }
  
    if (!this.editing && data.fecha_hasta) {
      this.showToast('No puede establecer Fecha Hasta al crear. Cree la asignación como vigente.', 'bg-primary');
      return;
    }
  
    if (this.editing && this.selectedId) {
      this.empleadoConceptosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Asignación actualizada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAsignaciones();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar asignación', 'bg-primary')
      });
    } else {
      this.empleadoConceptosService.create(data).subscribe({
        next: () => {
          this.showToast('Asignación creada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAsignaciones();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear asignación', 'bg-primary')
      });
    }
  }

  editAsignacion(asignacion: EmpleadoConcepto, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = asignacion.id_empleado_concepto;
    this.asignacionForm.patchValue(asignacion);
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteAsignacion(id: number): void {
    this.empleadoConceptosService.delete(id).subscribe({
      next: (resp) => {
        const fechaHasta = resp.registro?.fecha_hasta;
        this.showToast(`Asignación desactivada el ${fechaHasta}`, 'bg-danger');
        this.loadAsignaciones();
      },
      error: () => this.showToast('Error al eliminar asignación', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  handleEditClick(asignacion: EmpleadoConcepto, content: TemplateRef<any>): void {
    if (asignacion.fecha_hasta) {
      this.showToast('Asignación inactiva, cree una nueva', 'bg-secondary');
      return;
    }
    this.editAsignacion(asignacion, content);
  }
  
  handleDeleteClick(asignacion: EmpleadoConcepto): void {
    if (asignacion.fecha_hasta) {
      this.showToast('La asignación ya está desactivada', 'bg-secondary');
      return;
    }
    this.deleteAsignacion(asignacion.id_empleado_concepto);
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (normalized !== input.value) {
      input.value = normalized;
      this.asignacionForm.get('valor')?.setValue(normalized, { emitEvent: false });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.asignacionForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
