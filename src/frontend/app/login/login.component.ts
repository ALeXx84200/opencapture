import {Component, OnInit} from '@angular/core';
import {Validators, FormBuilder} from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "../env";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "../../services/notifications/notifications.service";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {LocalStorageService} from "../../services/local-storage.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: any;
    submittedForm: boolean = false;

    constructor(
        private http: HttpClient,
        private router: Router,
        private formBuilder: FormBuilder,
        private translate: TranslateService,
        private notify: NotificationService,
        private localStorage: LocalStorageService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required]
        });
    }

    onSubmit() {
        this.submittedForm = true;
        let password = this.loginForm.get('password').value
        let username = this.loginForm.get('username').value
        if (password && username){
            this.http.post(
                API_URL + '/ws/login',
                {
                    'username': username,
                    'password': password,
                },
                {
                    observe: 'response'
                },
            ).pipe(
                tap((data: any) => {
                    this.localStorage.resetLocal();
                    this.authService.setUser(data.body.user)
                    this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.authService.getUser())));
                    this.notify.success(this.translate.instant('AUTH.authenticated'))
                    this.router.navigate(['/home']);
                }),
                catchError((err: any) => {
                    console.debug(err)
                    if (err.error === 'Authentication Failed') {
                        this.notify.error(this.translate.instant('AUTH.bad_password'));
                    } else if (err.error === 'Bad username') {
                        this.notify.error(this.translate.instant('AUTH.bad_username'));
                    } else if (err.error === 'User disabled') {
                        this.notify.error(this.translate.instant('AUTH.account_disabled'));
                    } else if (err.error === 'User deleted') {
                        this.notify.error(this.translate.instant('AUTH.account_deleted'));
                    } else {
                        this.notify.handleSoftErrors(err);
                    }
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        if(this.loginForm.get(field).hasError('required')){
            return this.translate.instant('AUTH.field_required')
        }
        return this.translate.instant('GLOBAL.unknow_error')
    }
}
