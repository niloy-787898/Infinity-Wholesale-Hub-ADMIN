import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserDataService} from '../../../services/common/user-data.service';
import {UiService} from '../../../services/core/ui.service';

@Component({
  selector: 'app-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.scss']
})
export class UserChangePasswordComponent implements OnInit, OnDestroy {

  dataForm?: FormGroup;

  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private userDataService: UserDataService,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<UserChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.dataForm = this.fb.group({
      oldPassword: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn('Please complete all the required fields');
      return;
    }

    this.changeLoggedInUserPassword();

  }


  /**
   * HTTP REQ HANDLE
   * GET ATTRIBUTES BY ID
   */

  private changeLoggedInUserPassword() {
    this.spinner.show();
    this.userDataService.changeLoggedInUserPassword(this.dataForm?.value)
      .subscribe(res => {
        this.spinner.hide();
        if (res.success) {
          this.uiService.success(res.message);
          this.dialogRef.close();
        } else {
          this.uiService.wrong(res.message);
        }
      }, error => {
        console.log(error);
        this.spinner.hide();
      });
  }

  ngOnDestroy() {

  }


}
