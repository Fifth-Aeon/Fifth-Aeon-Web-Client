import { NgModule } from '@angular/core';
import {
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
  MatTooltipModule,
  MatFormFieldModule,
  MatOptionModule,
  MatRadioModule,
  MatSnackBarModule,
  MatSliderModule,
  MatTabsModule,
  MatMenuModule,
  MatListModule,
  MatCheckboxModule
} from '@angular/material';

let matModules = [
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
  MatCheckboxModule
];


@NgModule({
  imports: matModules,
  exports: matModules
})
export class MaterialModule { }
