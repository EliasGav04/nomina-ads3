import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MovimientosService } from '../../services/movimientos.service';
import { PeriodosService } from '../../services/periodos.service';
import { EmpleadosService } from '../../services/empleados.service';
import { ConceptosService } from '../../services/conceptos.service';
import { Movimiento, Periodo, Empleado, Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
    private modalService: NgbModal
  ) {
    this.movimientoForm = this.fb.group({
      id_periodo: [null],
      id_empleado: [null],
      id_concepto: [null],
      monto: [0],
      descripcion: [''],
      estado: ['Activo']
    });
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
    this.movimientoForm.reset({ monto: 0 });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveMovimiento(): void {
    const data = { ...this.movimientoForm.value };

    if (this.editing && this.selectedId) {
      this.movimientosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Movimiento actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadMovimientos();
        },
        error: () => this.showToast('Error al actualizar movimiento', 'bg-danger')
      });
    } else {
      this.movimientosService.create(data).subscribe({
        next: () => {
          this.showToast('Movimiento creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadMovimientos();
        },
        error: () => this.showToast('Error al crear movimiento', 'bg-danger')
      });
    }
  }

  editMovimiento(movimiento: Movimiento, content: TemplateRef<any>): void {
    // Validar estado del movimiento
    if (movimiento.estado === 'Anulado') {
      this.showToast('No es posible modificar un movimiento anulado', 'bg-primary');
      return;
    }
  
    // Validar estado del período
    if (movimiento.Periodo?.estado !== 'Abierto') {
      this.showToast('No es posible modificar movimientos de periodos procesados o cerrados', 'bg-primary');
      return;
    }
  
    this.editing = true;
    this.selectedId = movimiento.id_movimiento;
    this.movimientoForm.patchValue(movimiento);
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteMovimiento(movimiento: Movimiento): void {
    // Validar estado del movimiento
    if (movimiento.estado === 'Anulado') {
      this.showToast('No es posible modificar un movimiento anulado', 'bg-primary');
      return;
    }
  
    // Validar estado del período
    if (movimiento.Periodo?.estado !== 'Abierto') {
      this.showToast('No es posible modificar movimientos de periodos procesados o cerrados', 'bg-primary');
      return;
    }
  
    this.movimientosService.delete(movimiento.id_movimiento).subscribe({
      next: () => {
        this.showToast('Movimiento anulado correctamente', 'bg-secondary');
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
}
