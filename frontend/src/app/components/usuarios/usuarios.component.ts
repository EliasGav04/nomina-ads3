import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.usuarioForm = this.fb.group({
      usuario: [''],
      clave: [''],
      estado: ['Activo'],
      id_rol: [null]
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

  openModal(content: TemplateRef<any>): void {
    this.editing = false;
    this.usuarioForm.reset({ estado: 'Activo' });
    this.modalRef = this.modalService.open(content, { backdrop: 'static' });
  }

  saveUsuario(): void {
    const data = { ...this.usuarioForm.value, estado: 'Activo' };

    if (this.editing && this.selectedId) {
      this.usuariosService.update(this.selectedId, data).subscribe({
        next: () => {
          this.showToast('Usuario actualizado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadUsuarios();
        },
        error: () => this.showToast('Error al actualizar usuario', 'bg-danger')
      });
    } else {
      this.usuariosService.create(data).subscribe({
        next: () => {
          this.showToast('Usuario creado correctamente', 'bg-success');
          this.modalRef?.close();
          this.loadUsuarios();
        },
        error: () => this.showToast('Error al crear usuario', 'bg-danger')
      });
    }
  }

  editUsuario(usuario: Usuario, content: TemplateRef<any>): void {
    this.editing = true;
    this.selectedId = usuario.id_usuario;
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
        this.showToast('Usuario inactivado correctamente', 'bg-warning');
        this.loadUsuarios();
      },
      error: () => this.showToast('Error al inactivar usuario', 'bg-danger')
    });
  }

  resetForm(): void {
    this.editing = false;
    this.selectedId = null;
    this.usuarioForm.reset({ estado: 'Activo' });
  }

  showToast(message: string, color: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
