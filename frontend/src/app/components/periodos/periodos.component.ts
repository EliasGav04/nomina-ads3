import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PeriodosService } from '../../services/periodos.service';
import { Periodo } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-periodos',
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.css']
})

export class PeriodosComponent implements OnInit {

  periodos: Periodo[] = [];
  periodoActual: Periodo | null = null;
  diasRestantes: number = 0;

  periodoForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  estadoLabels: { [key: string]: string } = {
    Abierto: 'Abierto',
    Procesado: 'Procesado',
    Cerrado: 'Cerrado'
  };

  constructor(
    private periodosService: PeriodosService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.periodoForm = this.fb.group({
      periodo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      fecha_inicio: ['', [Validators.required]],
      fecha_final: ['', [Validators.required]],
      fecha_pago: ['', [Validators.required]],
      estado: ['Abierto']
    });
  }

  ngOnInit(): void {
    this.loadPeriodos();
  }

  loadPeriodos(): void {
    this.periodosService.getAll().subscribe(data => {
      this.periodos = data;
      this.periodoActual =
        this.periodos.find(p => p.estado === 'Abierto') ||
        this.periodos.find(p => p.estado === 'Procesado') ||
        null;
      if (this.periodoActual?.fecha_pago) {
        const hoy = new Date();
        const fechaPago = new Date(this.periodoActual.fecha_pago);
        const diff = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        this.diasRestantes = diff > 0 ? diff : 0;
      } else {
        this.diasRestantes = 0;
      }
    });
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.periodoForm.reset({ estado: 'Abierto' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  handleEditClick(periodo: Periodo, content: TemplateRef<any>): void {
    if (periodo.estado !== 'Abierto') {
      this.showToast('No se puede actualizar un período Procesado o Cerrado', 'bg-primary');
      return;
    }
  
    this.editing = true;
    this.selectedId = periodo.id_periodo;
    this.periodoForm.patchValue(periodo);
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  handleDeleteClick(periodo: Periodo): void {
    if (periodo.estado === 'Procesado' || periodo.estado === 'Cerrado') {
      this.showToast('No se puede eliminar un período Procesado o Cerrado', 'bg-primary');
      return;
    }

    this.showToast('La eliminación de períodos Abiertos no está permitida', 'bg-primary');
  }

  savePeriodo(): void {
    if (this.periodoForm.invalid) {
      this.periodoForm.markAllAsTouched();
      this.showToast('Complete correctamente todos los campos requeridos', 'bg-warning');
      return;
    }

    const data = { ...this.periodoForm.value };
    if (data.fecha_inicio > data.fecha_final) {
      this.showToast('La fecha de inicio no puede ser mayor que la fecha final', 'bg-warning');
      return;
    }
    if (data.fecha_pago < data.fecha_final) {
      this.showToast('La fecha de pago no puede ser anterior a la fecha final', 'bg-warning');
      return;
    }
  
    if (this.editing && this.selectedId) {
      // actualización
      this.periodosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Período actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadPeriodos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar período', 'bg-danger')
      });
    } else {
      // creación
      this.periodosService.create(data).subscribe({
        next: () => {
          this.showToast('Período creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadPeriodos();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear período', 'bg-danger')
      });
    }
  }

  cerrarPeriodo(id: number | undefined): void {
    if (!id) return;
    if (this.periodoActual?.estado !== 'Procesado') {
      this.showToast('Primero debe ejecutar nómina para pasar el período a Procesado', 'bg-primary');
      return;
    }
    this.periodosService.delete(id).subscribe({
      next: () => {
        this.showToast('Período cerrado correctamente', 'bg-warning');
        this.loadPeriodos();
      },
      error: () => this.showToast('Error al cerrar período', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  isInvalid(controlName: string): boolean {
    const control = this.periodoForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
