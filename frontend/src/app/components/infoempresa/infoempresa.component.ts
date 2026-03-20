import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InfoempresaService } from '../../services/infoempresa.service';
import { Infoempresa } from '../../interfaces/interface';

@Component({
  selector: 'app-infoempresa',
  templateUrl: './infoempresa.component.html',
  styleUrls: ['./infoempresa.component.css']
})
export class InfoempresaComponent implements OnInit {

  empresaForm: FormGroup;
  empresa: Infoempresa | null = null;
  selectedFile: File | null = null;
  logoBase64: string | null = null;

  // Toast
  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;

  constructor(
    private infoempresaService: InfoempresaService,
    private fb: FormBuilder
  ) {
    this.empresaForm = this.fb.group({
      nombre: [''],
      razon_social: [''],
      rtn: [''],
      direccion: [''],
      telefono: [''],
      correo: [''],
      sitio_web: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmpresa();
  }

  loadEmpresa(): void {
    this.infoempresaService.getById(1).subscribe({
      next: (data) => {
        this.empresa = data;
        this.empresaForm.patchValue(data);
  
        this.logoBase64 = data.logoBase64 || 'assets/no-photo.png';
      },
      error: () => this.showToast('Error al cargar empresa', 'bg-danger')
    });
  }

  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    let binary = '';
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveEmpresa(): void {
    const formData = new FormData();
    Object.keys(this.empresaForm.value).forEach(key => {
      formData.append(key, this.empresaForm.value[key]);
    });
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    if (this.empresa) {
      this.infoempresaService.updateWithFormData(this.empresa.id_empresa, formData).subscribe({
        next: () => {
          this.showToast('Empresa actualizada correctamente', 'bg-success');
          this.loadEmpresa();
        },
        error: () => this.showToast('Error al actualizar empresa', 'bg-danger')
      });
    } else {
      this.infoempresaService.createWithFormData(formData).subscribe({
        next: () => {
          this.showToast('Empresa creada correctamente', 'bg-success');
          this.loadEmpresa();
        },
        error: () => this.showToast('Error al crear empresa', 'bg-danger')
      });
    }
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
