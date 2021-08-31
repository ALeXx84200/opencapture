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
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../../../services/user.service";
import {FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-output-create',
    templateUrl: './create-output.component.html',
    styleUrls: ['./create-output.component.scss']
})
export class CreateOutputComponent implements OnInit {
    loading             : boolean       = true;
    outputsTypes        : any[]         = [];
    outputForm          : any[]         = [
        {
            id: 'output_type_id',
            label: this.translate.instant('HEADER.output_type'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: this.outputsTypes
        },
        {
            id: 'output_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/outputs/getOutputsTypes', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputsTypes = data.outputs_types;
            }),
            finalize(() => {this.loading = false;}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then();
                return of(false);
            })
        ).subscribe();
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    createOutput() {
        if (this.isValidForm(this.outputForm)) {
            const outputTypeId = this.getValueFromForm(this.outputForm, 'output_type_id');
            const outputLabel = this.getValueFromForm(this.outputForm, 'output_label');
            this.http.post(API_URL + '/ws/outputs/create',
                {'args': {
                    'output_type_id': outputTypeId,
                    'output_label': outputLabel,
                }}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('OUTPUT.created'));
                    this.router.navigate(['/settings/verifier/outputs/update/' + data.id]).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/verifier/outputs');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getValueFromForm(form: any, fieldId: any) {
        let value = '';
        form.forEach((element: any) => {
            if (fieldId === element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    getErrorMessage(field: any, form: any) {
        let error: any;
        form.forEach((element: any) => {
            if (element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

}
