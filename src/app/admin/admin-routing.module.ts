import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from 'app/login.guard';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

const routes: Routes = [
    {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [LoggedInGuard]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}
