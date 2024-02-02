import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {UiService} from "../../../services/core/ui.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {UsersService} from "../../../services/common/users.service";
import {Users} from "../../../interfaces/common/users.interface";



@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  // Data Form
  @ViewChild('formElement') formElement: NgForm;
  dataForm?: FormGroup;

  // Store Data
  id?: string;
  users?: Users;


  constructor(
    private fb: FormBuilder,
    private uiService: UiService,
    private spinnerService: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private usersService: UsersService,
    private router: Router,

  ) { }

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;
  private subDataThree: Subscription;


  ngOnInit(): void {
    // Init Data Form
    this.initDataForm()

    // GET ID FORM PARAM

    this.activatedRoute.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getUsersById();
      }
    });
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      firstname: [null, Validators.required],
      lastname: [null],
      username: [null],
      password: [null],
      phone: [null],
      email: [null],
      role: [null],
      image: [null],
    });
  }

  private setFormValue() {
    this.dataForm.patchValue(this.users);
  }

  onSubmit() {

    if (this.dataForm.invalid) {
      this.uiService.warn('Please filed all the required field');
      return;
    }
    if (this.users) {
      this.updateUsersById();
    }
    else {
      this.addUsers();
    }

  }


  /**
   * HTTP REQ HANDLE
   * getUsersById()
   * addUsers()
   * updateUsersById()
   */

  private addUsers() {
    this.spinnerService.show();
    this.subDataOne = this.usersService.addUsers(this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.formElement.resetForm();
            this.router.navigate(['/people/', 'user-list']);
          } else {
            this.uiService.warn(res.message);
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private getUsersById() {
    this.spinnerService.show();
    this.subDataTwo = this.usersService.getUsersById(this.id)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.data) {
            this.users = res.data;
            console.log(this.users)
            this.setFormValue();
          }
        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }

  private updateUsersById() {
    this.spinnerService.show();
    this.subDataThree = this.usersService.updateUsersById(this.users._id,this.dataForm.value)
      .subscribe({
        next: (res => {
          this.spinnerService.hide();
          if (res.success) {
            this.uiService.success(res.message);
            this.router.navigate(['/people/', 'user-list']);
          } else {
            this.uiService.warn(res.message);
          }

        }),
        error: (error => {
          this.spinnerService.hide();
          console.log(error);
        })
      });
  }


  /**
   * ON DESTROY
   */

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
  }
}
