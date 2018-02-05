import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RegisterComponent } from './register/register.component';
import { MaterialModule } from '../material.module';
import { AuthenticationService } from './authentication.service';
import { LoginComponent } from './login/login.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ResetPasswordComponent } from 'app/user/reset-password/reset-password.component';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    RegisterComponent, LoginComponent, VerifyEmailComponent, ResetPasswordComponent
  ],
  providers: [AuthenticationService],
  declarations: [RegisterComponent, LoginComponent, VerifyEmailComponent, ResetPasswordComponent]
})
export class UserModule { }
