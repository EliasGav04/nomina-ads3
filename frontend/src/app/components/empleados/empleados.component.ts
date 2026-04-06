import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  readonly today = new Date().toISOString().split('T')[0];
  private readonly dniPattern = /^\d{13}$/;
  private readonly nombrePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
  private readonly cargoPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()\-\/\s]+$/;
  private readonly cuentaPattern = /^\d{14,20}$/;

  constructor(
    private empleadosService: EmpleadosService,
    private areasService: AreasService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.empleadoForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(this.dniPattern)]],
      nombre_completo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120), Validators.pattern(this.nombrePattern)]],
      cargo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(this.cargoPattern)]],
      fecha_ingreso: ['', [Validators.required]],
      numero_ihss: ['', [Validators.required, Validators.pattern(this.dniPattern)]],
      cta_bancaria: ['', [Validators.required, Validators.pattern(this.cuentaPattern)]],
      salario_base: [0, [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      estado: ['Activo'],
      id_area: [null, [Validators.required]]
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
    this.selectedId = null;
    this.empleadoForm.reset({ estado: 'Activo', salario_base: 0 });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      this.showToast('Complete correctamente los campos del empleado', 'bg-primary');
      return;
    }

    const fechaIngreso = this.empleadoForm.get('fecha_ingreso')?.value;
    if (fechaIngreso && fechaIngreso > this.today) {
      this.showToast('La fecha de ingreso no puede ser mayor al día actual', 'bg-primary');
      return;
    }

    const data = { ...this.empleadoForm.value, estado: 'Activo' };

    if (this.editing && this.selectedId) {
      this.empleadosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Empleado actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadEmpleados();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar empleado', 'bg-primary')
      });
    } else {
      this.empleadosService.create(data).subscribe({
        next: () => {
          this.showToast('Empleado creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadEmpleados();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear empleado', 'bg-primary')
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
        this.showToast('Empleado inactivado correctamente', 'bg-danger');
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

  onDniInput(event: Event, controlName: 'dni' | 'numero_ihss'): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 13);
    if (digits !== input.value) {
      input.value = digits;
      this.empleadoForm.get(controlName)?.setValue(digits, { emitEvent: false });
    }
  }

  onNombreInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    if (filtered !== input.value) {
      input.value = filtered;
      this.empleadoForm.get('nombre_completo')?.setValue(filtered, { emitEvent: false });
    }
  }

  onCuentaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 20);
    if (digits !== input.value) {
      input.value = digits;
      this.empleadoForm.get('cta_bancaria')?.setValue(digits, { emitEvent: false });
    }
  }

  onSalarioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');
    if (normalized !== input.value) {
      input.value = normalized;
      this.empleadoForm.get('salario_base')?.setValue(normalized, { emitEvent: false });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.empleadoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
