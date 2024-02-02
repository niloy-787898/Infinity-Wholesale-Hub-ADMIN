import { Component, OnInit } from '@angular/core';
import {UiService} from "../../../services/core/ui.service";
import {Router} from "@angular/router";
import {ReloadService} from "../../../services/core/reload.service";
import {Subscription} from "rxjs";
import {FilterData} from "../../../interfaces/gallery/filter-data";
import {Users} from "../../../interfaces/common/users.interface";
import {UsersService} from "../../../services/common/users.service";
import { AdminPermissions } from 'src/app/enum/admin-permission.enum';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  // Admin Base Data
  adminId: string;
  role: string;
  permissions: AdminPermissions[];

  // Store Data
  users: Users[] = [];
  usersCount = 0;
  id?: string;

  constructor(
    private usersService: UsersService,
    private uiService: UiService,
    private router: Router,
    private reloadService: ReloadService
  ) {}

  // Subscriptions
  private subDataOne: Subscription;
  private subDataTwo: Subscription;

  ngOnInit(): void {
    this.reloadService.refreshBrand$.subscribe(() => {
      this.getAllUsers();
    });
    this.getAllUsers();
  }

  /**
   * CHECK ADMIN PERMISSION
   * checkAddPermission()
   * checkDeletePermission()
   * checkEditPermission()
   * getAdminBaseData()
   */
  checkAddPermission(): boolean {
    return this.permissions.includes(AdminPermissions.CREATE);
  }

  checkDeletePermission(): boolean {
    return this.permissions.includes(AdminPermissions.DELETE);
  }

  checkEditPermission(): boolean {
    return this.permissions.includes(AdminPermissions.EDIT);
  }

  /**
   * HTTP REQ HANDLE
   * getAllUsers()
   * deleteUsersById()
   */

  private getAllUsers() {
    const filter: FilterData = {
      filter: null,
      pagination: null,
      select: {
        firstname: 1,
        lastname: 1,
        username: 1,
        phone: 1,
        email: 1,
        roll: 1,
        image: 1,
        createdAt: 1,
      },
      sort: { createdAt: -1 },
    };

    this.subDataOne = this.usersService.getAllUsers(filter, null).subscribe({
      next: (res) => {
        // console.log(res)
        if (res.success) {
          this.users = res.data;
          this.usersCount = res.count;
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private deleteUsersById(id: any) {
    this.subDataTwo = this.usersService.deleteUsersById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.warn(`User Deleted`);
          this.reloadService.needRefreshBrand$();
          this.router.navigate(['/people/', 'user-list']);
        } else {
          this.uiService.warn(res.message);
        }
      },
      error: (err) => {
        console.log(err);
      },
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
  }
}
