import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RolesService } from '../../services/roles.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol, Usuario } from '../../interfaces/interface';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  roles: Rol[] = [];
  usuarios: Usuario[] = [];
  usuarioForm: FormGroup;
  editing: boolean = false;
  selectedId: number | null = null;

  showModal: boolean = false;

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private fb: FormBuilder
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
    this.rolesService.getAll().subscribe(data => {
      this.roles = data;
    });
  }

  loadUsuarios(): void {
    this.usuariosService.getAll().subscribe(data => {
      this.usuarios = data;
    });
  }

  

  //modal
  openModal(): void {
    this.showModal = true;
    this.editing = false;
    this.usuarioForm.reset({ estado: 'Activo' });
  }
  
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  saveUsuario(): void {
    const data = { ...this.usuarioForm.value, estado: 'Activo' };
  
    if (this.editing && this.selectedId) {
      this.usuariosService.update(this.selectedId, data).subscribe(() => {
        this.closeModal();
        this.loadUsuarios();
      });
    } else {
      this.usuariosService.create(data).subscribe(() => {
        this.closeModal();
        this.loadUsuarios();
      });
    }
  }

  editUsuario(usuario: Usuario): void {
    this.editing = true;
    this.selectedId = usuario.id_usuario;
    this.showModal = true;
    this.usuarioForm.patchValue({
      usuario: usuario.usuario,
      clave: '',
      estado: 'Activo',
      id_rol: usuario.id_rol
    });
  }

  deleteUsuario(id: number): void {
    this.usuariosService.delete(id).subscribe(() => {
      this.loadUsuarios();
    });
  }

  resetForm(): void {
    this.editing = false;
    this.selectedId = null;
    this.usuarioForm.reset({ estado: 'Activo' });
  }
}
