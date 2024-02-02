import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {UserService} from '../services/common/user.service';

@Injectable()
export class AuthUserInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.userService.getUserToken();
    if (authToken) {
      const authRequest = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + authToken)
      });
      return next.handle(authRequest);
    } else {
      const authRequest = req.clone();
      return next.handle(authRequest);
    }
  }
}
