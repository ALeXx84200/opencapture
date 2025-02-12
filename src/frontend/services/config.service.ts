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

import { Injectable } from '@angular/core';
import { environment } from  "../app/env";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "./notifications/notifications.service";
import { AuthService } from "./auth.service";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notify:NotificationService,
    ) {}

    readConfig() {
        return new Promise((resolve) => {
            this.http.get(environment['url'] + '/ws/config/readConfig', {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    this.setConfig(data.config);
                    resolve(true);
                }),
                catchError((err: any) => {
                    console.debug(err);
                    resolve(false);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        });
    }

    setConfig(config: any) {
        this.authService.setTokenCustom('OpenCaptureForInvoicesConfig', btoa(JSON.stringify(config)));
    }

    getConfig() {
        return JSON.parse(atob(this.authService.getTokenCustom('OpenCaptureForInvoicesConfig') as string));
    }
}
