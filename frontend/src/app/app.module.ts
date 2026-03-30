import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { ConceptosComponent } from './components/conceptos/conceptos.component';
import { PeriodosComponent } from './components/periodos/periodos.component';
import { InfoempresaComponent } from './components/infoempresa/infoempresa.component';
import { AreasComponent } from './components/areas/areas.component';
import { EmpleadoConceptosComponent } from './components/empleado-conceptos/empleado-conceptos.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UsuariosComponent,
    MainLayoutComponent,
    SidebarComponent,
    NavbarComponent,
    AuthLayoutComponent,
    EmpleadosComponent,
    ConceptosComponent,
    PeriodosComponent,
    InfoempresaComponent,
    AreasComponent,
    EmpleadoConceptosComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
