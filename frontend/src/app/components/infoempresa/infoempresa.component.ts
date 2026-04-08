import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InfoempresaService } from '../../services/infoempresa.service';
import { Infoempresa } from '../../interfaces/interface';
import { CurrencyConfigService } from '../../services/currency-config.service';

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

  //toast
  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;
  private readonly namePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()'"\-&\s]+$/;
  private readonly direccionPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()'"#\-/&\s]+$/;
  private readonly rtnPattern = /^\d{14}$/;
  private readonly telefonoMaxLen = 20;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private readonly webPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
  private readonly currencyPattern = /^[A-Z]{3}$/;
  private readonly maxLogoSizeBytes = 5 * 1024 * 1024; //max 5mb
  readonly currencyOptions: Array<{ code: string; label: string }> = [
    { code: 'HNL', label: 'HNL (Honduras)' },
    { code: 'USD', label: 'USD (Estados Unidos)' },
    { code: 'GTQ', label: 'GTQ (Guatemala)' },
    { code: 'CRC', label: 'CRC (Costa Rica)' },
    { code: 'NIO', label: 'NIO (Nicaragua)' },
    { code: 'PAB', label: 'PAB (Panamá)' },
    { code: 'SVC', label: 'SVC (El Salvador)' }
  ];

  constructor(
    private infoempresaService: InfoempresaService,
    private fb: FormBuilder,
    private currencyConfig: CurrencyConfigService
  ) {
    this.empresaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(this.namePattern)]],
      razon_social: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(this.namePattern)]],
      rtn: ['', [Validators.required, Validators.pattern(this.rtnPattern)]],
      direccion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(250), Validators.pattern(this.direccionPattern)]],
      telefono: ['', [Validators.required, Validators.maxLength(this.telefonoMaxLen), this.telefonoIntlValidator.bind(this)]],
      correo: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(this.emailPattern)]],
      sitio_web: ['', [Validators.maxLength(150), Validators.pattern(this.webPattern)]],
      codigo_moneda: ['HNL', [Validators.required, Validators.pattern(this.currencyPattern)]]
    });
  }

  ngOnInit(): void {
    this.loadEmpresa();
  }

  loadEmpresa(): void {
    this.infoempresaService.getById(1).subscribe({
      next: (data) => {
        this.empresa = data;
        this.empresaForm.patchValue({
          ...data,
          telefono: this.telefonoUnSoloGuion((data.telefono || '').trim()),
          codigo_moneda: data.codigo_moneda || 'HNL'
        });
        this.currencyConfig.setCurrencyCode(data.codigo_moneda || 'HNL');
  
        this.logoBase64 = data.logoBase64 || 'assets/no-photo.png';
      },
      error: () => this.showToast('Error al cargar empresa', 'bg-primary')
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
    const file = event?.target?.files?.[0] as File | undefined;
    if (!file) return;

    if (file.size > this.maxLogoSizeBytes) {
      this.showToast('El logo excede el tamaño permitido (máximo 5 MB).', 'bg-primary');
      event.target.value = '';
      return;
    }

    this.selectedFile = file;
  
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  openLogoSelector(input: HTMLInputElement): void {
    input.click();
  }

  // Deja solo el primer guion
  private telefonoUnSoloGuion(v: string): string {
    const i = v.indexOf('-');
    if (i === -1) return v;
    return v.slice(0, i + 1) + v.slice(i + 1).replace(/-/g, '');
  }

  private telefonoIntlValidator(control: AbstractControl): ValidationErrors | null {
    const v = this.telefonoUnSoloGuion((control.value || '').trim());
    if (!v.startsWith('+')) return { telefonoIntl: true };
    const digits = v.slice(1).replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15 || digits[0] === '0') return { telefonoIntl: true };
    if (v.length > this.telefonoMaxLen) return { telefonoIntl: true };
    return null;
  }

  onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sel = input.selectionStart ?? 0;
    const oldLen = input.value.length;

    let v = input.value.replace(/[^\d+\s\-]/g, '');
    const plus = v.indexOf('+');
    if (plus > 0) v = v.slice(plus);
    if (v.length > 0 && !v.startsWith('+')) {
      v = '+' + v.replace(/\+/g, '');
    }
    //sin trim final
    v = v.replace(/^\s+/, '').replace(/\s+/g, ' ');
    v = this.telefonoUnSoloGuion(v);
    if (v.length > this.telefonoMaxLen) v = v.slice(0, this.telefonoMaxLen);

    this.empresaForm.get('telefono')?.setValue(v, { emitEvent: false });
    input.value = v;

    const delta = v.length - oldLen;
    let pos = sel + delta;
    if (delta === 0 && v.length === oldLen) pos = sel;
    pos = Math.max(0, Math.min(v.length, pos));
    requestAnimationFrame(() => input.setSelectionRange(pos, pos));
  }

  onRtnInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 14);
    if (digits !== input.value) {
      input.value = digits;
      this.empresaForm.get('rtn')?.setValue(digits, { emitEvent: false });
    }
  }

  saveEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      this.showToast('Complete correctamente los campos obligatorios', 'bg-primary');
      return;
    }

    const formData = new FormData();
    const formValues = this.empresaForm.value;
    Object.keys(formValues).forEach(key => {
      const rawValue = formValues[key];
      const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      formData.append(key, value ?? '');
    });
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    if (this.empresa) {
      this.infoempresaService.updateWithFormData(this.empresa.id_empresa, formData).subscribe({
        next: () => {
          this.showToast('Empresa actualizada correctamente', 'bg-success');
          this.currencyConfig.setCurrencyCode(this.empresaForm.get('codigo_moneda')?.value || 'HNL');
          this.loadEmpresa();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar empresa', 'bg-primary')
      });
    } else {
      this.infoempresaService.createWithFormData(formData).subscribe({
        next: () => {
          this.showToast('Empresa creada correctamente', 'bg-success');
          this.currencyConfig.setCurrencyCode(this.empresaForm.get('codigo_moneda')?.value || 'HNL');
          this.loadEmpresa();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear empresa', 'bg-primary')
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.empresaForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
