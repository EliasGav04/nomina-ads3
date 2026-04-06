import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '../../services/roles.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol, Usuario } from '../../interfaces/interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  roles: Rol[] = [];
  usuarios: Usuario[] = [];
  usuarioForm: FormGroup;
  editing = false;
  selectedId: number | null = null;

  private modalRef: NgbModalRef | null = null;

  // Toast
  toastMessage = '';
  toastColor = 'bg-success';
  toastVisible = false;
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,30}$/;
  filtroTexto = '';
  filtroRol: number | 'Todos' = 'Todos';
  filtroEstado: 'Todos' | 'Activo' | 'Inactivo' = 'Todos';

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.usuarioForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9@_]+$/)]],
      clave: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      estado: ['Activo'],
      id_rol: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.getAll().subscribe(data => this.roles = data);
  }

  loadUsuarios(): void {
    this.usuariosService.getAll().subscribe(data => this.usuarios = data);
  }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      const coincideTexto = !texto || [
        String(u.id_usuario || ''),
        (u.usuario || ''),
        (u.Rol?.rol || ''),
        (u.estado || '')
      ].some(v => v.toLowerCase().includes(texto));
      const coincideRol = this.filtroRol === 'Todos' || u.id_rol === this.filtroRol;
      const coincideEstado = this.filtroEstado === 'Todos' || u.estado === this.filtroEstado;
      return coincideTexto && coincideRol && coincideEstado;
    });
  }

  clearFiltros(): void {
    this.filtroTexto = '';
    this.filtroRol = 'Todos';
    this.filtroEstado = 'Todos';
  }

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.selectedId = null;
    this.usuarioForm.reset({ estado: 'Activo' });
    this.usuarioForm.get('clave')?.setValidators([Validators.required, Validators.pattern(this.passwordPattern)]);
    this.usuarioForm.get('clave')?.updateValueAndValidity();
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.showToast('Complete correctamente todos los campos requeridos', 'bg-primary');
      return;
    }

    const data = { ...this.usuarioForm.value, estado: 'Activo' };

    if (this.editing && this.selectedId) {
      this.usuariosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Usuario actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadUsuarios();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al actualizar usuario', 'bg-primary')
      });
    } else {
      this.usuariosService.create(data).subscribe({
        next: () => {
          this.showToast('Usuario creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadUsuarios();
        },
        error: (err) => this.showToast(err?.error?.error || 'Error al crear usuario', 'bg-primary')
      });
    }
  }

  editUsuario(usuario: Usuario, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = usuario.id_usuario;
    this.usuarioForm.get('clave')?.setValidators([Validators.pattern(this.passwordPattern)]);
    this.usuarioForm.get('clave')?.updateValueAndValidity();
    this.usuarioForm.patchValue({
      usuario: usuario.usuario,
      clave: '',
      estado: 'Activo',
      id_rol: usuario.id_rol
    });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  deleteUsuario(id: number): void {
    this.usuariosService.delete(id).subscribe({
      next: () => {
        this.showToast('Usuario inactivado correctamente', 'bg-danger');
        this.loadUsuarios();
      },
      error: (err) => this.showToast(err?.error?.error || 'Error al inactivar usuario', 'bg-danger')
    });
  }

  resetForm(): void {
    this.editing = false;
    this.selectedId = null;
    this.usuarioForm.reset({ estado: 'Activo' });
    this.usuarioForm.get('clave')?.setValidators([Validators.required, Validators.pattern(this.passwordPattern)]);
    this.usuarioForm.get('clave')?.updateValueAndValidity();
  }

  isInvalid(controlName: string): boolean {
    const control = this.usuarioForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
