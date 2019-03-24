import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTableModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

const matModules = [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSliderModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatCheckboxModule,
    MatTableModule,
    CdkTableModule
];

@NgModule({
    exports: matModules
})
export class MaterialModule {}
