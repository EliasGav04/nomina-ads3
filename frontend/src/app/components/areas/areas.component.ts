import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AreasService } from '../../services/areas.service';
import { Area } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit {

  areas: Area[] = [];
  areaForm: FormGroup;
  editing = false;
  selectedId: number | null = null;
  private modalRef: NgbModalRef | null = null;

  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  constructor(
    private areasService: AreasService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.areaForm = this.fb.group({
      area: [''],
      estado: ['Activo']
    });
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.areasService.getAll().subscribe(data => this.areas = data);
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.areaForm.reset({ estado: 'Activo' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveArea(): void {
    const data = { ...this.areaForm.value, estado: 'Activo' };

    if (this.editing && this.selectedId) {
      this.areasService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Área actualizada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAreas();
        },
        error: () => this.showToast('Error al actualizar área', 'bg-danger')
      });
    } else {
      this.areasService.create(data).subscribe({
        next: () => {
          this.showToast('Área creada correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadAreas();
        },
        error: () => this.showToast('Error al crear área', 'bg-danger')
      });
    }
  }

  editArea(area: Area, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = area.id_area;
    this.areaForm.patchValue({
      area: area.area,
      estado: area.estado
    });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteArea(id: number): void {
    this.areasService.delete(id).subscribe({
      next: () => {
        this.showToast('Área inactivada correctamente', 'bg-warning');
        this.loadAreas();
      },
      error: () => this.showToast('Error al inactivar área', 'bg-danger')
    });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
