import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { E401Component } from './e401/e401.component';
import { E500Component } from './e500/e500.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { AngularMaterialModule } from '../angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './login/auth.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  declarations: [
    E401Component,
    E500Component,
    ErrorComponent,
    LoginComponent,
  ],
  providers: [
    AuthService,
    HttpClientModule
  ],
  exports: [],
})
export class AuthenticationModule { }
