import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ReplaySubject, of, map } from "rxjs";
import { ConfirmEmail } from "src/app/shared/models/account/confirmEmail";
import { Login } from "src/app/shared/models/account/login.model";
import { Register } from "src/app/shared/models/account/register.model";
import { ResetPassword } from "src/app/shared/models/account/resetPassword.model";
import { User } from "src/app/shared/models/account/user.model";
import { environment } from "src/environments/environment.development";


@Injectable({
  providedIn: "root",
})
export class AccountService {
  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/account/register`, model);
  }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", "Bearer " + jwt);

    return this.http
      .get<User>(`${environment.appUrl}/api/account/refresh-user-token`, {
        headers,
      })
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  confirmEmail(model: ConfirmEmail) {
    return this.http.put(
      `${environment.appUrl}/api/account/confirm-email`,
      model
    );
  }

  resendEmailConfirmationLink(email: string) {
    return this.http.post(
      `${environment.appUrl}/api/account/resend-email-confirmation-link/${email}`,
      {}
    );
  }

  forgotUserNameOrPassword(email: string) {
    return this.http.post(
      `${environment.appUrl}/api/account/forgot-username-or-password/${email}`,
      {}
    );
  }

  resetPassword(model: ResetPassword) {
    return this.http.put(
      `${environment.appUrl}/api/account/reset-password`,
      model,
      {}
    );
  }

  login(model: Login) {
    // debugger;
    return this.http
      .post<User>(`${environment.appUrl}/api/account/login`, model)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
            // return user;
          }
          // return null;
        })
      );
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl("/");
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);

    this.user$.subscribe({
      next: (response) => console.log(response),
    });
  }
}
