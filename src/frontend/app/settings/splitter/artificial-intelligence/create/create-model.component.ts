import { Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {HistoryService} from "../../../../../services/history.service";
import {environment} from "../../../../env";
import {catchError, of, tap} from "rxjs";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.scss']
})

export class CreateModelComponent implements OnInit {
    loading         : boolean       = true;
    docs : any =[];
    doc_types = Array();
    docStatus = Array();
    totalChecked    : number  = 0;
    formControls : any = [];
    formForm : any = [];
    listModels : any =[];
    forms : any =[];
    chosenForm:any=[];
    chosenDocs:any=[];
    modelForm          : any[]         = [
        {
            id: 'model_label',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name"),
            placeholder: "exemple_modèle.sav",
            type: 'text',
            control: new FormControl('', Validators.pattern("[a-zA-Z0-9+._-éùà)(î]+\\.sav+")),
            required: true,
        },
        {
            id: 'model_stop',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.min_proba"),
            type: 'text',
            control: new FormControl('', Validators.pattern("^[1-9][0-9]?$|^100$")),
            required: true,
        },
    ];

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private historyService: HistoryService,
        public privilegesService: PrivilegesService,
    ) { }

    ngOnInit() {
        this.serviceSettings.init();
        this.retrieveModels();
        this.retrieveDoctypes();
        this.retrieveOCDoctypes();
        this.retrieveForms();
        }

    retrieveDoctypes() {
        this.http.get(environment['url'] + '/ws/artificial_intelligence/getTrainDocuments', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.docs = data;
                this.docStatus.splice(0);
                for (const element of this.docs){
                    this.docStatus.push({doc:element, isSelected:false, linked_doctype:"", linked_form:""});
                    this.formControls.push(new FormControl(''));
                    this.formForm.push(new FormControl('',[Validators.required]));
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }


    checkSelectedBatch() {
        this.totalChecked = this.docStatus.filter((a: { isSelected: boolean }) => a.isSelected).length;
    }

    retrieveOCDoctypes() {
        this.doc_types=[];
        this.http.get(environment['url'] + '/ws/artificial_intelligence/list/' + 'document', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.doctypes.forEach((doctype: {
                    id          : number
                    key         : string
                    code        : string
                    label       : string
                    type        : string
                    status      : string
                    is_default  : boolean
                    form_id     : boolean
                }) => {
                    newDoctype = {
                        'id': doctype.id,
                        'key': doctype.key,
                        'code': doctype.code,
                        'label': doctype.label,
                        'type': doctype.type,
                        'status': doctype.status,
                        'isDefault': doctype.is_default,
                        'formId': doctype.form_id,
                    };
                    this.doc_types.push(newDoctype);
                    }
                );
                }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
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

    changeOutputType(event: any, doc: string) {
        const val = event.value;
        const match = this.docStatus.find((a: { doc: string }) => a.doc === doc);
        match.linked_doctype = val;
        return true;
    }

    onFormSelect(event: any, index: number, doc: string){
        const val = event.value;
        for (const element of this.forms) {
            if (element.id === val) {
                this.chosenForm[index]=element.id;
                this.chosenDocs[index]=this.doc_types.filter((a: { formId: number }) => a.formId === this.chosenForm[index]);
            }
        }
        this.formControls[index].value = this.chosenDocs[index][0].id;
        const match = this.docStatus.find((a: { doc: string }) => a.doc === doc);
        match.linked_doctype = this.chosenDocs[index][0].id;
        match.linked_form = this.chosenForm[index];
    }

    createModel() {
        let start_training = true;
        if (this.isValidForm(this.modelForm) && this.totalChecked > 1 && this.isValidForm2(this.formControls)) {
            const model_name = this.getValueFromForm(this.modelForm, 'model_label');
            const min_pred = this.getValueFromForm(this.modelForm, 'model_stop');
            const doctypes = [];
            const matches = this.docStatus.filter((a: { isSelected: boolean }) => a.isSelected);
            for (let i = 0; i < this.totalChecked; i = i + 1) {
                const fold = matches[i].doc;
                const oc_target = matches[i].linked_doctype;
                const formid = matches[i].linked_form;
                doctypes.push({folder:fold, doctype:oc_target, form:formid});
            }

            for (const element of this.listModels) {
                const exists = Object.values(element).includes(model_name);
                if (exists) {
                    this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.already_existing_model'));
                    start_training = false;
                    break;
                    }
                }
            if (start_training) {
                this.http.post(environment['url'] + '/ws/artificial_intelligence/TrainModel/' + model_name,
                    {docs: doctypes, min_pred: min_pred}, {headers: this.authService.headers}).pipe(
                    catchError((err: any) => {
                        console.debug(err);
                        return of(false);
                    })
                ).subscribe();

                this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.created'));
                this.historyService.addHistory('splitter', 'create_model', this.translate.instant('HISTORY-DESC.create-model', {model: model_name}));
                this.router.navigate(['/settings/splitter/artificial-intelligence']).then();
            }
        }
        else {
        if(this.totalChecked < 2){
            this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.not_enough_checked'));
        }}
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

    isValidForm2(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.status !== 'DISABLED' && element.status !== 'VALID') || element.value == null) {
                state = false;
            }
            element.markAsTouched();
        });
        return state;
    }

    isSelectRequired(form: any, selected: any){
        if (selected) {
            form.setValidators([Validators.required]);
        } else {
            form.clearValidators();
        }
        form.updateValueAndValidity();
        return 0;
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

    retrieveModels() {
        this.http.get(environment['url'] + '/ws/artificial_intelligence/getAIModels?module=splitter&limit=', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.listModels = data.models;
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    retrieveForms(){
        this.http.get(environment['url'] + '/ws/forms/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
               this.forms = forms.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    displayDoctypes(form: any){
        return !!form.value;
    }
}
