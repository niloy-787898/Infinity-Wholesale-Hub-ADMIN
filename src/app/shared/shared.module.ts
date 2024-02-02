import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SnackbarNotificationComponent} from './components/ui/snackbar-notification/snackbar-notification.component';
import {ConfirmDialogComponent} from './components/ui/confirm-dialog/confirm-dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {OutSideClickDirective} from './directives/out-side-click.directive';


@NgModule({
  declarations: [
    SnackbarNotificationComponent,
    ConfirmDialogComponent,
    OutSideClickDirective,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  exports: [
    SnackbarNotificationComponent,
    ConfirmDialogComponent,
    OutSideClickDirective,
  ],
  providers: []
})
export class SharedModule {
}
