import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {LastUrlService} from "../../../../services/last-url.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {API_URL} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {ConfirmDialogComponent} from "../../../../services/confirm-dialog/confirm-dialog.component";
import {Sort} from "@angular/material/sort";

@Component({
    selector: 'app-list',
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit {
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean     = true;
    columnsToDisplay: string[]    = ['id', 'name', 'company_number', 'vat_number', 'siret', 'siren', 'actions'];
    customers       : any         = [];
    pageSize        : number      = 10;
    pageIndex       : number      = 0;
    total           : number      = 0;
    offset          : number      = 0;
    search          : string      = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('accounts/customers') || lastUrl == '/') {
            if (this.localeStorageService.get('customersPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('customersPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }else
            this.localeStorageService.remove('customersPageIndex');

        this.loadCustomers()
    }

    loadCustomers() {
        this.http.get(API_URL + '/ws/accounts/customers/list?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customers = data.customers;
                if (this.customers.length !== 0) {
                    this.total = data.customers[0].total
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    searchCustomer(event: any) {
        this.search = event.target.value;
        this.loadCustomers();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('customersPageIndex', event.pageIndex);
        this.loadCustomers();
    }

    deleteConfirmDialog(customer_id: number, customer: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_customer', {"customer": customer}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteSupplier(customer_id)
            }
        });
    }

    deleteSupplier(supplier_id: number) {
        if (supplier_id !== undefined) {
            this.http.delete(API_URL + '/ws/accounts/customers/delete/' + supplier_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadCustomers()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    sortData(sort: Sort) {
        let data = this.customers.slice()
        if(!sort.active || sort.direction === '') {
            this.customers = data
            return;
        }

        this.customers = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'name': return this.compare(a.name, b.name, isAsc);
                case 'company_number': return this.compare(a.company_number, b.company_number, isAsc);
                case 'vat_number': return this.compare(a.vat_number, b.vat_number, isAsc);
                case 'siret': return this.compare(a.siret, b.siret, isAsc);
                case 'siren': return this.compare(a.siren, b.siren, isAsc);
                default: return 0;
            }
        });

    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

}
