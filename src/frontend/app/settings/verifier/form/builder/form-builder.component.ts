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
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";

@Component({
    selector: 'form-builder',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.scss'],
})
export class FormBuilderComponent implements OnInit {
    loading                 : boolean   = true;
    outputs                 : any[]     = [];
    form                    : any       = {
        'label': {
            'control': new FormControl(),
        },
        'default_form': {
            'control': new FormControl(),
        }
    };
    outputForm              : any       = [
        {
            control: new FormControl(),
            cpt: 0
        }
    ];
    formId                  : any;
    creationMode            : boolean   = true;
    labelType               : any []    = [
        marker('TYPES.text'),
        marker('TYPES.textarea'),
        marker('TYPES.date'),
        marker('TYPES.select'),
        marker('VERIFIER.field_settings'),
        marker('FORMS.delete_field'),
    ];
    fieldCategories         : any []    = [
        {
            'id': 'supplier',
            'label': marker('FORMS.supplier')
        },
        {
            'id': 'facturation',
            'label': marker('FACTURATION.facturation')
        },
        {
            'id': 'other',
            'label': marker('FORMS.other')
        }
    ];
    availableFieldsParent   : any []    = [
        {
            'id': 'accounts_fields',
            'label': marker('ACCOUNTS.supplier'),
            'values': [
                {
                    id: 'name',
                    label: marker('ACCOUNTS.supplier_name'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'alphanum',
                    format_icon:'fas fa-hashtag',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'siret',
                    label: marker('ACCOUNTS.siret'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'number_int',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'siren',
                    label: marker('ACCOUNTS.siren'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'lime',
                    format: 'number_int',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'vat_number',
                    label: marker('ACCOUNTS.vat_number'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'olive',
                    format: 'alphanum',
                    format_icon:'fas fas fa-hashtag',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'address1',
                    label: marker('ADDRESSES.address_1'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'alphanum',
                    format_icon:'fas fas fa-hashtag',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'address2',
                    label: marker('ADDRESSES.address_2'),
                    unit: 'addresses',
                    type: 'text',
                    required: false,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'alphanum',
                    format_icon:'fas fas fa-hashtag',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'postal_code',
                    label: marker('ADDRESSES.postal_code'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_int',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'city',
                    label: marker('ADDRESSES.city'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'char',
                    format_icon:'fas fa-font',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'country',
                    label: marker('ADDRESSES.country'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'char',
                    format_icon:'fas fa-font',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
            ]
        },
        {
            'id': 'facturation_fields',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': [
                {
                    id: 'order_number',
                    label: marker('FACTURATION.order_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'yellow',
                    format: 'alphanum_extended',
                    format_icon: 'fas fa-hashtag',
                    display: 'multi',
                    display_icon:'fas fa-layer-group'

                },
                {
                    id: 'delivery_number',
                    label: marker('FACTURATION.delivery_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'silver',
                    format: 'alphanum_extended',
                    format_icon: 'fas fa-hashtag',
                    display: 'multi',
                    display_icon:'fas fa-layer-group'
                },
                {
                    id: 'invoice_number',
                    label: marker('FACTURATION.invoice_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'red',
                    format: 'alphanum_extended',
                    format_icon: 'fas fa-hashtag',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'invoice_date',
                    label: marker('FACTURATION.invoice_date'),
                    unit: 'facturation',
                    type: 'date',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'yellow',
                    format: 'date',
                    format_icon: 'fas fa-calendar-day',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'invoice_due_date',
                    label: marker('FACTURATION.invoice_due_date'),
                    unit: 'facturation',
                    type: 'date',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'blue',
                    format: 'date',
                    format_icon: 'fas fa-calendar-day',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'vat_rate',
                    label: marker('FACTURATION.vat_rate'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'pink',
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'multi',
                    display_icon:'fas fa-layer-group'
                },
                {
                    id: 'no_rate_amount',
                    label: marker('FACTURATION.no_rate_amount'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'fuschia',
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'multi',
                    display_icon:'fas fa-layer-group'
                },
                {
                    id: 'vat_amount',
                    label: marker('FACTURATION.vat_amount'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'purple',
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'multi',
                    display_icon:'fas fa-layer-group'
                },
                {
                    id: 'accounting_plan',
                    label: marker('FACTURATION.accounting_plan'),
                    unit: 'facturation',
                    type: 'select',
                    required: false,
                    format: 'select',
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    display: 'multi',
                    display_icon:'fas fa-layer-group'
                },
                {
                    id: 'total_ttc',
                    label: marker('FACTURATION.total_ttc'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'total_ht',
                    label: this.translate.instant('FACTURATION.total_ht'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
                {
                    id: 'total_vat',
                    label: this.translate.instant('FACTURATION.total_vat'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fas fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: '',
                    format: 'number_float',
                    format_icon:'text-lg icomoon-numbers',
                    display: 'simple',
                    display_icon:'fas file-alt'
                },
            ]
        },
        {
            'id': 'custom_fields',
            'label': marker('FORMS.custom_fields'),
            'values': []
        },
    ];
    fields                  : any       = {
        'supplier': [],
        'facturation': [],
        'other': []
    };
    classList               : any []    = [
        {
            'id': 'w-full',
            'label': '1'
        },
        {
            'id': 'w-1/2',
            'label': '1/2'
        },
        {
            'id': 'w-30',
            'label': '1/3'
        },
        {
            'id': 'w-1/3',
            'label': '1/33'
        },
        {
            'id': 'w-1/4',
            'label': '1/4'
        },
        {
            'id': 'w-1/5',
            'label': '1/5'
        }
    ];
    colorsList              : any []    = [
        {
            'id': 'yellow',
            'label': marker('COLORS.yellow')
        },
        {
            'id': 'pink',
            'label': marker('COLORS.pink')
        },
        {
            'id': 'red',
            'label': marker('COLORS.red')
        },
        {
            'id': 'blue',
            'label': marker('COLORS.blue')
        },
        {
            'id': 'orange',
            'label': marker('COLORS.orange')
        },
        {
            'id': 'purple',
            'label': marker('COLORS.purple')
        },
        {
            'id': 'black',
            'label': marker('COLORS.black')
        },
        {
            'id': 'white',
            'label': marker('COLORS.white')
        },
        {
            'id': 'aqua',
            'label': marker('COLORS.aqua')
        },
        {
            'id': 'maroon',
            'label': marker('COLORS.maroon')
        },
        {
            'id': 'teal',
            'label': marker('COLORS.teal')
        },
        {
            'id': 'navy',
            'label': marker('COLORS.navy')
        },
        {
            'id': 'fuchsia',
            'label': marker('COLORS.fuchsia')
        },
        {
            'id': 'silver',
            'label': marker('COLORS.silver')
        },
        {
            'id': 'gray',
            'label': marker('COLORS.gray')
        },
        {
            'id': 'lime',
            'label': marker('COLORS.lime')
        },
        {
            'id': 'green',
            'label': marker('COLORS.green')
        },
    ];
    formatList              : any []    = [
        {
            'id': 'date',
            'label': marker('FORMATS.date'),
            'icon': 'fas fa-calendar-day'
        },
        {
            'id': 'number_float',
            'label': marker('FORMATS.number_float'),
            'icon': 'text-lg icomoon-numbers'
        },
        {
            'id': 'number_int',
            'label': marker('FORMATS.number_int'),
            'icon': 'text-lg icomoon-numbers'
        },
        {
            'id': 'char',
            'label': marker('FORMATS.char'),
            'icon': 'fas fa-font'
        },
        {
            'id': 'alphanum',
            'label': marker('FORMATS.alphanum'),
            'icon': 'fas fa-hashtag'
        },
        {
            'id': 'alphanum_extended',
            'label': marker('FORMATS.alphanum_extended'),
            'icon': 'fas fa-level-up-alt'
        }
    ];
    displayList             : any []    = [
        {
            'id': 'simple',
            'label': marker('DISPLAY.simple'),
            'icon': 'fas fa-file-alt'
        },
        {
            'id': 'multi',
            'label': marker('DISPLAY.multi'),
            'icon': 'fas fa-layer-group'
        },
    ];
    mandatoryList           : any []    = [
        {
            'id': true,
            'label': marker('MANDATORY.required'),
            'icon': 'fas fa-star'
        },
        {
            'id': false,
            'label': marker('MANDATORY.not_required'),
            'icon': 'far fa-star'
        },
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.formId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/outputs/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputs = data.outputs;
                if (this.formId) {
                    this.creationMode = false;
                    this.http.get(API_URL + '/ws/forms/getById/' + this.formId, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            for (const field in this.form) {
                                for (const info in data) {
                                    if (info === field) this.form[field].control.setValue(data[field]);
                                }
                            }

                            if (data.outputs) {
                                const length = data.outputs.length;
                                if (length === 1) this.outputForm[0].control.setValue(data.outputs[0]);
                                if (length > 1) {
                                    for (const cpt in data.outputs) {
                                        if (parseInt(cpt) !== 0) this.addOutput();
                                        this.outputForm[cpt].control.setValue(data.outputs[cpt]);
                                    }
                                }
                            }
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }),catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(API_URL + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.customFields) {
                    for (const field in data.customFields) {
                        if (data.customFields.hasOwnProperty(field)) {
                            if(data.customFields[field].module === 'verifier') {
                                for (const parent in this.availableFieldsParent) {
                                    if(this.availableFieldsParent[parent].id === 'custom_fields') {
                                        this.availableFieldsParent[parent].values.push(
                                            {
                                                id: 'custom_' + data.customFields[field].id,
                                                label: data.customFields[field].label,
                                                unit: 'custom',
                                                type: data.customFields[field].type,
                                                format: data.customFields[field].type,
                                                required: data.customFields[field].required,
                                                class: "w-1/3",
                                                class_label: "1/33",
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        if (this.formId) {
            this.http.get(API_URL + '/ws/forms/getFields/' + this.formId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.form_fields.fields) {
                        if(data.form_fields.fields.facturation !== undefined)
                            this.fields.facturation = data.form_fields.fields.facturation;
                        if(data.form_fields.fields.supplier)
                            this.fields.supplier = data.form_fields.fields.supplier;
                        if(data.form_fields.fields.other)
                            this.fields.other = data.form_fields.fields.other;

                        for (const category in this.fields) {
                            if (this.fields.hasOwnProperty(category)) {
                                this.fields[category].forEach((currentField: any) => {
                                    this.availableFieldsParent.forEach((parent: any) => {
                                        let cpt = 0;
                                        parent['values'].forEach((childFields: any) => {
                                            if (currentField.id === childFields.id) {
                                                parent['values'].splice(cpt, 1);
                                            }
                                            cpt = cpt + 1;
                                        });
                                    });
                                });
                            }
                        }
                    }
                }),
                finalize(() => setTimeout(() => {
                    this.loading = false;
                }, 500)),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }else {
            this.loading = false;
        }
    }

    dropFromAvailableFields(event: any) {
        const unit = event.previousContainer.id;
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[unit],
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    changeClass(fieldId: any, newClass: any, classLabel: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.class = newClass;
                element.class_label = classLabel;
            }
        });
    }

    changeFormat(fieldId: any, newFormat: any, formatIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.format = newFormat;
                element.format_icon = formatIcon;
            }
        });
    }

    changeDisplay(fieldId: any, newDisplay: any, displayIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.display = newDisplay;
                element.display_icon = displayIcon;
            }
        });
    }

    changeRequired(fieldId: any, newRequired: any, requiredIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.required = newRequired;
                element.required_icon = requiredIcon;
            }
        });
    }

    changeColor(fieldId: any, newColor: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.color = newColor;
            }
        });
    }

    dropFromForm(event: any) {
        const unit = event.container.id;
        const previousUnit = event.previousContainer.id;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[previousUnit],
                event.container.data ? event.container.data : this.fields[unit],
                event.previousIndex,
                event.currentIndex);
        }
    }

    deleteField(event: any, previousIndex: any, category:any, unit: any) {
        if (unit === 'addresses')
            unit = 'supplier';
        for (const parentField in this.availableFieldsParent) {
            const id = this.availableFieldsParent[parentField].id.split('_fields')[0];
            if (id === unit) {
                const currentIndex = this.availableFieldsParent[parentField]['values'].length;
                transferArrayItem(this.fields[category],
                    this.availableFieldsParent[parentField]['values'],
                    previousIndex,
                    currentIndex);
            }
        }
    }

    storeNewOrder(event: any, categoryId: any) {
        const tmpCurrentOrder: any[] = [];
        event.currentOrder.forEach((element: any) => {
            this.fields[categoryId].forEach((field: any) => {
                if (element.id === field.id) {
                    tmpCurrentOrder.push(element);
                }
            });
        });
        this.fields[categoryId] = tmpCurrentOrder;
    }

    addOutput() {
        this.outputForm[0].cpt = this.outputForm[0].cpt + 1;
        const cpt = this.outputForm[0].cpt;
        this.outputForm.push({
            'control': new FormControl(),
            'canRemove': true
        });
    }

    removeOutput(cpt: any) {
        this.outputForm.splice(cpt, 1);
    }

    updateForm() {
        const label = this.form.label.control.value;
        const isDefault = this.form.default_form.control.value;
        const outputs: any[] = [];
        this.outputForm.forEach((element: any) => {
            if (element.control.value) outputs.push(element.control.value);
        });

        if (label !== '' && outputs.length >= 1) {
            this.http.put(API_URL + '/ws/forms/update/' + this.formId, {'args': {'label' : label, 'default_form' : isDefault, 'outputs': outputs}}, {headers: this.authService.headers},
            ).pipe(
                tap(()=> {
                    this.http.post(API_URL + '/ws/forms/updateFields/' + this.formId, this.fields, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('FORMS.updated'));
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
        }else {
            if (!label && outputs.length === 0) this.notify.error(this.translate.instant('FORMS.label_and_output_mandatory'));
            else if (!label) this.notify.error(this.translate.instant('FORMS.label_mandatory'));
            else if (outputs.length === 0) this.notify.error(this.translate.instant('FORMS.output_type_mandatory'));
        }
    }

    createForm() {
        const label = this.form.label.control.value;
        const isDefault = this.form.default_form.control.value;
        if (label) {
            this.http.post(API_URL + '/ws/forms/add', {'args': {'label' : label, 'default_form' : isDefault}}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.http.post(API_URL + '/ws/forms/updateFields/' + data.id, this.fields, {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                    this.notify.success(this.translate.instant('FORMS.created'));
                    this.router.navigateByUrl('settings/verifier/forms').then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }else{
            this.notify.error(this.translate.instant('FORMS.label_mandatory'));
        }
    }
}
