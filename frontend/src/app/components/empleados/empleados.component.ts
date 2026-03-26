import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmpleadosService } from '../../services/empleados.service';
import { AreasService } from '../../services/areas.service';
import { Empleado, Area } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})

export class EmpleadosComponent implements OnInit {

  empleados: Empleado[] = [];
  areas: Area[] = [];
  empleadoForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  constructor(
    private empleadosService: EmpleadosService,
    private areasService: AreasService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.empleadoForm = this.fb.group({
      dni: [''],
      nombre_completo: [''],
      cargo: [''],
      fecha_ingreso: [''],
      numero_ihss: [''],
      cta_bancaria: [''],
      estado: ['Activo'],
      id_area: [null]
    });
  }

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadAreas();
  }

  loadEmpleados(): void {
    this.empleadosService.getAll().subscribe(data => this.empleados = data);
  }

  loadAreas(): void {
    this.areasService.getAll().subscribe(data => this.areas = data);
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.empleadoForm.reset({ estado: 'Activo' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveEmpleado(): void {
    const data = { ...this.empleadoForm.value, estado: 'Activo' };

    if (this.editing && this.selectedId) {
      this.empleadosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Empleado actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadEmpleados();
        },
        error: () => this.showToast('Error al actualizar empleado', 'bg-danger')
      });
    } else {
      this.empleadosService.create(data).subscribe({
        next: () => {
          this.showToast('Empleado creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadEmpleados();
        },
        error: () => this.showToast('Error al crear empleado', 'bg-danger')
      });
    }
  }

  editEmpleado(empleado: Empleado, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = empleado.id_empleado;
    this.empleadoForm.patchValue(empleado);
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteEmpleado(id: number): void {
    this.empleadosService.delete(id).subscribe({
      next: () => {
        this.showToast('Empleado inactivado correctamente', 'bg-warning');
        this.loadEmpleados();
      },
      error: () => this.showToast('Error al inactivar empleado', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
