import {Component, OnDestroy, OnInit} from '@angular/core';
import {Select} from '../../interfaces/core/select';
import {MONTHS} from '../../core/utils/app-data';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ProjectService} from '../../services/common/project.service';
import {UiService} from '../../services/core/ui.service';
import {ReloadService} from '../../services/core/reload.service';
import {UtilsService} from '../../services/core/utils.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ProjectControllerComponent} from '../../shared/dialog-view/project-controller/project-controller.component';
import {ConfirmDialogComponent} from '../../shared/components/ui/confirm-dialog/confirm-dialog.component';
import {FilterData} from '../../interfaces/gallery/filter-data';
import {Project} from '../../interfaces/common/project.interface';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  // Store data
  projects: Project[] = [];
  isLoading: boolean = true;

  // Static Data
  months: Select[] = MONTHS;

  // Filter & Sort
  filter: any = null;

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;
  private subDataFour: Subscription;
  private subReloadOne: Subscription;

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private uiService: UiService,
    private reloadService: ReloadService,
    private utilsService: UtilsService,
    private spinnerService: NgxSpinnerService,
  ) {
  }

  ngOnInit(): void {

    // Re fetch Data
    this.subReloadOne = this.reloadService.refreshData$
      .subscribe(() => {
        this.getAllProjects();
      })

    this.getAllProjects();
  }


  /**
   * COMPONENT DIALOG VIEW
   * openProjectControllerDialog()
   */
  public openProjectControllerDialog(data?: Project) {
    const dialogRef = this.dialog.open(ProjectControllerComponent, {
      maxWidth: '800px',
      data: data
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult && dialogResult.data) {
        if (data) {
          this.updateProjectById(data._id, dialogResult.data);
        } else {
          this.addProject(dialogResult.data);
        }

      }
    });

  }

  public openConfirmDialog(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want delete this data?'
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteProjectById(id);
      }
    });

  }


  /**
   * HTTP REQ HANDLE
   * getAllProjects()
   * addProject()
   * deleteProjectById()
   * updateProjectById()
   */

  getAllProjects() {

    this.spinnerService.show();

    const filterData: FilterData = {
      pagination: null,
      filter: null,
      select: {
        name: 1,
        note: 1,
      },
      sort: {
        createdAt: -1
      }
    }

    this.subDataOne = this.projectService.getAllProjects(filterData, null)
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.spinnerService.hide();
          this.projects = res.data;
        },
        error: (err) => {
          this.isLoading = false;
          this.spinnerService.hide();
          console.log(err)
        }
      })
  }

  addProject(data: Project) {
    this.subDataTwo = this.projectService.addProject(data)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.reloadService.needRefreshData$();
            this.uiService.success('Project added successfully.')
          } else {
            this.uiService.wrong('Error! Please try again.')
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
  }

  deleteProjectById(id: string) {
    this.subDataThree = this.projectService.deleteProjectByIdUser(id)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.reloadService.needRefreshData$();
            this.uiService.success('Project deleted successfully.')
          } else {
            this.uiService.wrong('Error! Please try again.')
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
  }

  updateProjectById(id: string, data: Project) {
    this.subDataFour = this.projectService.updateProjectByIdUser(id, data)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.reloadService.needRefreshData$();
            this.uiService.success('Project updated successfully.')
          } else {
            this.uiService.wrong('Error! Please try again.')
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
  }


  ngOnDestroy() {
    if (this.subDataOne) {
      this.subDataOne.unsubscribe();
    }

    if (this.subDataTwo) {
      this.subDataTwo.unsubscribe();
    }

    if (this.subDataThree) {
      this.subDataThree.unsubscribe();
    }

    if (this.subDataFour) {
      this.subDataFour.unsubscribe();
    }

    if (this.subReloadOne) {
      this.subReloadOne.unsubscribe();
    }

  }

}
