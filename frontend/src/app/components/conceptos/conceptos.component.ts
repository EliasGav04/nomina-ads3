import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConceptosService } from '../../services/conceptos.service';
import { Concepto } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
    private modalService: NgbModal
  ) {
    this.conceptoForm = this.fb.group({
      concepto: [''],
      tipo: ['ingreso'],
      naturaleza: ['fijo'],
      valor_defecto: [0],
      es_global: [false],
      estado: ['Activo']
    });
  }

  ngOnInit(): void {
    this.loadConceptos();
  }

  loadConceptos(): void {
    this.conceptosService.getAll().subscribe(data => this.conceptos = data);
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.conceptoForm.reset({ tipo: 'ingreso', naturaleza: 'fijo', valor_defecto: 0, es_global: false, estado: 'Activo' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveConcepto(): void {
    const data = { ...this.conceptoForm.value, estado: 'Activo' };
  
    if (this.editing && this.selectedId) {
      this.conceptosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Concepto actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadConceptos();
        },
        error: () => this.showToast('Error al actualizar concepto', 'bg-danger')
      });
    } else {
      this.conceptosService.create(data).subscribe({
        next: () => {
          this.showToast('Concepto creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadConceptos();
        },
        error: () => this.showToast('Error al crear concepto', 'bg-danger')
      });
    }
  }

  editConcepto(concepto: Concepto, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = concepto.id_concepto;
    this.conceptoForm.patchValue(concepto);
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteConcepto(id: number): void {
    this.conceptosService.delete(id).subscribe({
      next: () => {
        this.showToast('Concepto inactivado correctamente', 'bg-warning');
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
}
