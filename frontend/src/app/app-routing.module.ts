import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
import { BoletapagoComponent } from './components/boletapago/boletapago.component';
import { ReportesComponent } from './components/reportes/reportes.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
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
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH', 'Consultor'] }
      },
      { 
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'infoempresa',
        component: InfoempresaComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'areas',
        component: AreasComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      { 
        path: 'conceptos',
        component: ConceptosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      { 
        path: 'empleados',
        component: EmpleadosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      { 
        path: 'empleado-conceptos',
        component: EmpleadoConceptosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      { 
        path: 'periodos',
        component: PeriodosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      { 
        path: 'movimientos',
        component: MovimientosComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      {
        path: 'nomina',
        component: NominaComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH'] }
      },
      {
        path: 'boleta-pago',
        component: BoletapagoComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH', 'Consultor'] }
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'RRHH', 'Consultor'] }
      },
      
      
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
