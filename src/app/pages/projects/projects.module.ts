import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NoContentModule} from '../../shared/lazy/no-content/no-content.module';
import {NgxSpinnerModule} from 'ngx-spinner';
import {MatMenuModule} from '@angular/material/menu';
import {ProjectControllerModule} from '../../shared/dialog-view/project-controller/project-controller.module';


@NgModule({
  declarations: [
    ProjectsComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    NoContentModule,
    NgxSpinnerModule,
    MatMenuModule,
    ProjectControllerModule,
  ]
})
export class ProjectsModule { }
