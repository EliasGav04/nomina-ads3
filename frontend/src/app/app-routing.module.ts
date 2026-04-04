import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { InfoempresaComponent } from './components/infoempresa/infoempresa.component';
import { AreasComponent } from './components/areas/areas.component';
import { ConceptosComponent } from './components/conceptos/conceptos.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { EmpleadoConceptosComponent } from './components/empleado-conceptos/empleado-conceptos.component';
import { PeriodosComponent } from './components/periodos/periodos.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';
import { NominaComponent } from './components/nomina/nomina.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { 
        path: 'login',
        component: LoginComponent
      },
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard',
        component: DashboardComponent
      },
      { 
        path: 'usuarios',
        component: UsuariosComponent 
      },
      { 
        path: 'infoempresa',
        component: InfoempresaComponent 
      },
      { 
        path: 'areas',
        component: AreasComponent 
      },
      { 
        path: 'conceptos',
        component: ConceptosComponent 
      },
      { 
        path: 'empleados',
        component: EmpleadosComponent 
      },
      { 
        path: 'empleado-conceptos',
        component: EmpleadoConceptosComponent 
      },
      { 
        path: 'periodos',
        component: PeriodosComponent 
      },
      { 
        path: 'movimientos',
        component: MovimientosComponent 
      },
      {
        path: 'nomina',
        component: NominaComponent
      },
      
      
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
