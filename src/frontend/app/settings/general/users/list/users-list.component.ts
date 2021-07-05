import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { catchError, finalize, tap } from "rxjs/operators";
import { API_URL } from "../../../../env";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { LocalStorageService } from "../../../../../services/local-storage.service";
import { LastUrlService } from "../../../../../services/last-url.service";
import { Sort } from "@angular/material/sort";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})

export class UsersListComponent implements OnInit {
    headers: HttpHeaders          = this.authService.headers;
    loading : boolean             = true;
    columnsToDisplay: string[]    = ['id', 'username', 'firstname', 'lastname', 'role','status', 'actions'];
    users : any                   = [];
    pageSize : number             = 10;
    pageIndex: number             = 0;
    total: number                 = 0;
    offset: number                = 0;
    roles : any                   = [];

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
        this.serviceSettings.init()
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('users/') || lastUrl == '/'){
            if (this.localeStorageService.get('usersPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('usersPageIndex'))
            this.offset = this.pageSize * (this.pageIndex)
        }else
            this.localeStorageService.remove('usersPageIndex')

        this.http.get(API_URL + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.roles = data.roles
                this.loadUsers()
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('usersPageIndex', event.pageIndex)
        this.loadUsers()
    }

    loadUsers(): void {
        this.http.get(API_URL + '/ws/users/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.total = data.users[0].total
                this.users = data.users;
                if (this.roles){
                    this.users.forEach((user: any) => {
                        this.roles.forEach((element: any) => {
                            if (user.role == element.id){
                                user.role_label = element.label
                            }
                        })
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    deleteConfirmDialog(user_id: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_delete', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.deleteUser(user_id)
            }
        });
    }

    disableConfirmDialog(user_id: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_disable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.disableUser(user_id)
            }
        });
    }

    enableConfirmDialog(user_id: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_enable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.enableUser(user_id)
            }
        });
    }

    deleteUser(user_id: number){
        if (user_id !== undefined){
            this.http.delete(API_URL + '/ws/users/delete/' + user_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
    }

    disableUser(user_id: number){
        if (user_id !== undefined){
            this.http.put(API_URL + '/ws/users/disable/' + user_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
    }

    enableUser(user_id: number){
        if (user_id !== undefined){
            this.http.put(API_URL + '/ws/users/enable/' + user_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
    }

    sortData(sort: Sort){
        let data = this.users.slice()
        if(!sort.active || sort.direction === ''){
            this.users = data
            return;
        }

        this.users = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'username': return this.compare(a.username, b.username, isAsc);
                case 'firstname': return this.compare(a.firstname, b.firstname, isAsc);
                case 'lastname': return this.compare(a.lastname, b.lastname, isAsc);
                case 'role': return this.compare(a.role_label, b.role_label, isAsc);
                case 'status': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });

    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}