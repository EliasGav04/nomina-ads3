import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpleadoConceptosService } from '../../services/empleado-conceptos.service';
import { EmpleadosService } from '../../services/empleados.service';
import { ConceptosService } from '../../services/conceptos.service';
import { EmpleadoConcepto, Empleado, Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
    private modalService: NgbModal
  ) {
    this.asignacionForm = this.fb.group({
      id_empleado: [null],
      id_concepto: [null],
      valor: [0],
      fecha_desde: [''],
      fecha_hasta: ['']
    });
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
    this.asignacionForm.reset({ valor: 0 });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveAsignacion(): void {
    const data = { ...this.asignacionForm.value };

    if (this.editing && this.selectedId) {
      this.empleadoConceptosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Asignación actualizada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAsignaciones();
        },
        error: () => this.showToast('Error al actualizar asignación', 'bg-danger')
      });
    } else {
      this.empleadoConceptosService.create(data).subscribe({
        next: () => {
          this.showToast('Asignación creada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAsignaciones();
        },
        error: () => this.showToast('Error al crear asignación', 'bg-danger')
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
      next: () => {
        this.showToast('Asignación eliminada correctamente', 'bg-warning');
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
}
