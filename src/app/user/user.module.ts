import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResetPasswordComponent } from 'app/user/reset-password/reset-password.component';
import { MaterialModule } from '../material.module';
import { AuthenticationService } from './authentication.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        RouterModule
    ],
    exports: [
        RegisterComponent,
        LoginComponent,
        VerifyEmailComponent,
        ResetPasswordComponent
    ],
    providers: [AuthenticationService],
    declarations: [
        RegisterComponent,
        LoginComponent,
        VerifyEmailComponent,
        ResetPasswordComponent
    ]
})
export class UserModule {}
