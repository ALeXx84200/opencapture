import { Component, OnInit } from '@angular/core';
import {API_URL} from "../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notifications/notifications.service";
import {SettingsService} from "../../services/settings.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})

export class StatisticsComponent implements OnInit {
    data    : any = [];
    users   : any = [];
    loading : boolean = true;
    options : any = [
        {
            'id': 'invoices_validated_per_user',
            'label': 'STATISTICS.invoices_validated_per_user'
        }
    ];
    selectedStatistic : any;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
    ) {}

    ngOnInit(): void {
        this.getUsersProcessDocument();
    }

    getUsersProcessDocument() {
        this.http.get(API_URL + '/ws/users/list_full', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.users = [];
                this.http.get(API_URL + '/ws/history/users', {headers: this.authService.headers}).pipe(
                    tap((userHistory: any) => {
                        userHistory.history.forEach((_user: any) => {
                            data.users.forEach((user: any) => {
                                if (_user.user_id === user.id) {
                                    this.users.push(user);
                                }
                            });
                        });
                        this.http.get(API_URL + '/ws/history/list?submodule=invoice_validated', {headers: this.authService.headers}).pipe(
                            tap((submodules: any) => {
                                this.users.forEach((user: any) => {
                                    let historyCpt = 0;
                                    submodules.history.forEach((_submodule: any) => {
                                        if (user.id === _submodule.user_id) {
                                            historyCpt += 1;
                                        }
                                    });
                                    this.data.push({
                                        'name': user.lastname + ' ' + user.firstname,
                                        'value': historyCpt
                                    });
                                });
                                console.log(this.data);
                                this.loading = false;
                            }),
                            catchError((err: any) => {
                                console.debug(err);
                                this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe();
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    changeStatistic(event: any) {
        if (event.value) {
            this.options.forEach((option: any) => {
                if (option.id === event.value) {
                    this.selectedStatistic = option;
                }
            });
        }
    }
}
