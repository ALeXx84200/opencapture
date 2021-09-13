import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {API_URL} from "../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "./auth.service";
import {NotificationService} from "./notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {DateAdapter} from "@angular/material/core";
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class LocaleService {
    currentLang         : string = 'fra';
    dateAdaptaterLocale : string = 'fr-FR';
    langs               : [] = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private _adapter: DateAdapter<any>
    ) {
        this._adapter.setLocale('fr-FR');
        moment.updateLocale('fr-FR', {
            monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
            weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'HH:mm:ss',
                L : 'dd/MM/YYYY',
                l : 'dd/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY HH:mm',
                LLLL : 'dddd D MMMM YYYY HH:mm'
            },
            week : {
                dow : 1, // Monday is the first day of the week.
            }
        });
        moment.updateLocale('en-GB', {
            longDateFormat : {
                LT: "h:mm A",
                LTS: "h:mm:ss A",
                L: "MM/dd/YYYY",
                l: "MM/dd/YYYY",
                LL: "MMMM Do YYYY",
                LLL: "MMMM Do YYYY LT",
                LLLL: "dddd, MMMM Do YYYY LT",
                llll: "ddd, MMM D YYYY LT"
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
            }
        });
        moment.locale(this.dateAdaptaterLocale);
    }

    changeLocale(data: any) {
        this.http.get(API_URL + '/ws/i18n/changeLanguage/' + data.value, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.getCurrentLocale();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getCurrentLocale() {
        this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
            tap((data: any) => {
                this.currentLang = data.lang;
                if (data.moment_lang)
                    this.dateAdaptaterLocale = data.moment_lang;
                this._adapter.setLocale(this.dateAdaptaterLocale);
                this.translate.use(this.currentLang);
                moment.locale(this.dateAdaptaterLocale);
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getLocales() {
        this.http.get(API_URL + '/ws/i18n/getAllLang', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.langs = data.langs;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
