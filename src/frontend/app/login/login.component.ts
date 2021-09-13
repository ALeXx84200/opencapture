/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import {Validators, FormBuilder} from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "../env";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "../../services/notifications/notifications.service";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {ConfigService} from "../../services/config.service";
import {LocaleService} from "../../services/locale.service";
import {UserService} from "../../services/user.service";
import {HistoryService} from "../../services/history.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: any;

    constructor(
        private router: Router,
        private http: HttpClient,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private configService: ConfigService,
        private localeService: LocaleService,
        private historyService: HistoryService,
    ) {}

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required]
        });
        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }
    }

    onSubmit() {
        const password = this.loginForm.get('password').value;
        const username = this.loginForm.get('username').value;
        if (password && username) {
            this.http.post(
                API_URL + '/ws/auth/login',
                {
                    'username': username,
                    'password': password,
                    'lang': this.localeService.currentLang
                },
                {
                    observe: 'response'
                },
            ).pipe(
                tap((data: any) => {
                    this.userService.setUser(data.body.user);
                    this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())), data.body.days_before_exp);
                    this.authService.generateHeaders();
                    this.notify.success(this.translate.instant('AUTH.authenticated'));
                    this.configService.readConfig().then(() => {
                        this.historyService.addHistory('general', 'login', this.translate.instant('HISTORY-DESC.login'));
                        if (this.authService.getCachedUrl()) {
                            this.router.navigate([this.authService.getCachedUrl()]).then();
                            this.authService.cleanCachedUrl();
                        } else {
                            this.router.navigate(['/home']).then();
                        }
                    });
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        if(this.loginForm.get(field).hasError('required'))
            return this.translate.instant('AUTH.field_required');
        return this.translate.instant('ERROR.unknow_error');
    }
}
