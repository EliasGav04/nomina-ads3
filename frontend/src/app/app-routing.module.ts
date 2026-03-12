import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';


const routes: Routes = [
  { 
    path: 'dashboard',
    component: DashboardComponent, canActivate: [authGuard]
  },
  { path: 'login',
     component: LoginComponent
  },
  { path: 'usuarios',
    component: UsuariosComponent
 },



  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
