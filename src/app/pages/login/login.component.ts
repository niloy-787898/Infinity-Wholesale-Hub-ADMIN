import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UiService} from '../../services/core/ui.service';
import {Meta} from '@angular/platform-browser';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from '../../services/common/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Basic
  public env = environment;
  public year = new Date().getFullYear();
  // Reactive Form
  loginForm: FormGroup;
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);

  constructor(
    private uiService: UiService,
    private userService: UserService,
    private meta: Meta,
    private spinner: NgxSpinnerService,
  ) {
  }

  ngOnInit(): void {
    // Main reactive form..
    this.loginForm = new FormGroup({
      username: this.username,
      password: this.password
    });

  }

  /**
   * Login
   */
  onLogin() {
    if (this.loginForm.invalid) {
      this.uiService.wrong('Invalid Input field!');
      return;
    }
    // Spinner..
    this.spinner.show();
    // Form Data..
    const username = this.loginForm.value.username.trim().toLowerCase();
    const password = this.loginForm.value.password;

    const data = {username, password};


    this.userService.userLogin(data);
  }


}
