import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovimientosService } from '../../services/movimientos.service';
import { PeriodosService } from '../../services/periodos.service';
import { EmpleadosService } from '../../services/empleados.service';
import { ConceptosService } from '../../services/conceptos.service';
import { Movimiento, Periodo, Empleado, Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyConfigService } from '../../services/currency-config.service';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {

  movimientos: Movimiento[] = [];
  movimientoForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  periodosAbiertos: Periodo[] = [];
  empleadosActivos: Empleado[] = [];
  conceptosManuales: Concepto[] = [];

  constructor(
    private movimientosService: MovimientosService,
    private periodosService: PeriodosService,
    private empleadosService: EmpleadosService,
    private conceptosService: ConceptosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private currencyConfig: CurrencyConfigService
  ) {
    this.movimientoForm = this.fb.group({
      id_periodo: [null, [Validators.required]],
      id_empleado: [null, [Validators.required]],
      id_concepto: [null, [Validators.required]],
      monto: [0, [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      estado: ['Activo']
    });
  }

  get currencySymbol(): string {
    return this.currencyConfig.getCurrencySymbol();
  }

  ngOnInit(): void {
    this.loadMovimientos();
    this.loadSelectsInfo();
  }

  loadMovimientos(): void {
    this.movimientosService.getAll().subscribe(data => this.movimientos = data);
  }

  loadSelectsInfo(): void {
    // cargar listas para selects
    this.periodosService.getAbiertos().subscribe(data => this.periodosAbiertos = data);
    this.empleadosService.getActivos().subscribe(data => this.empleadosActivos = data);
    this.conceptosService.getManualesActivos().subscribe(data => this.conceptosManuales = data);
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.movimientoForm.reset({ id_periodo: null, id_empleado: null, id_concepto: null, monto: 0, descripcion: '', estado: 'Activo' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      this.showToast('Complete correctamente todos los campos requeridos', 'bg-primary');
      return;
    }

    const data = { ...this.movimientoForm.value };
    if (Number(data.monto) === 0) {
      this.showToast('El monto debe ser diferente de 0', 'bg-primary');
      return;
    }

    if (this.editing && this.selectedId) {
      this.movimientosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Movimiento actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadMovimientos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar movimiento', 'bg-primary')
      });
    } else {
      this.movimientosService.create(data).subscribe({
        next: () => {
          this.showToast('Movimiento creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadMovimientos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear movimiento', 'bg-primary')
      });
    }
  }

  editMovimiento(movimiento: Movimiento, content: TemplateRef<any>): void {
    // Validar estado del período
    if (movimiento.Periodo?.estado !== 'Abierto') {
      this.showToast('No es posible modificar movimientos de periodos procesados o cerrados', 'bg-secondary');
      return;
    }
  
    this.editing = true;
    this.selectedId = movimiento.id_movimiento;
    this.movimientoForm.patchValue({
      id_periodo: movimiento.id_periodo,
      id_empleado: movimiento.id_empleado,
      id_concepto: movimiento.id_concepto,
      monto: movimiento.monto,
      descripcion: movimiento.descripcion,
      estado: movimiento.estado
    });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteMovimiento(movimiento: Movimiento): void {
    // Validar estado del movimiento
    if (movimiento.estado === 'Anulado') {
      this.showToast('No es posible modificar un movimiento anulado', 'bg-secondary');
      return;
    }
  
    // Validar estado del período
    if (movimiento.Periodo?.estado !== 'Abierto') {
      this.showToast('No es posible modificar movimientos de periodos procesados o cerrados', 'bg-secondary');
      return;
    }
  
    this.movimientosService.delete(movimiento.id_movimiento).subscribe({
      next: () => {
        this.showToast('Movimiento anulado correctamente', 'bg-danger');
        this.loadMovimientos();
      },
      error: () => this.showToast('Error al anular movimiento', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  onMontoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (normalized !== input.value) {
      input.value = normalized;
      this.movimientoForm.get('monto')?.setValue(normalized, { emitEvent: false });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.movimientoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
