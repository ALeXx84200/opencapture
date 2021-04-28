import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {MatDialog} from "@angular/material/dialog";
import {LastUrlService} from "../../../services/last-url.service";
import {LocalStorageService} from "../../../services/local-storage.service";
import {API_URL} from "../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {Sort} from "@angular/material/sort";
import {ConfirmDialogComponent} from "../../../services/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})

export class RolesComponent implements OnInit {
    columnsToDisplay: string[]    = ['id', 'label_short', 'label', 'editable', 'actions'];
    roles : any                   = [];
    pageSize : number             = 10;
    pageIndex: number             = 0;
    total: number                 = 0;
    offset: number                = 0;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private dialog: MatDialog,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('roles/') || lastUrl == '/'){
            if (this.localeStorageService.get('rolesPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('rolesPageIndex'))
            this.offset = this.pageSize * (this.pageIndex)
        }else
            this.localeStorageService.remove('rolesPageIndex')
        this.loadRoles()
    }

    loadRoles(): void{
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/roles/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers}).pipe(
            tap((data: any) => {
                this.total = data.roles[0].total
                this.roles = data.roles
            }),
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
        this.localeStorageService.save('rolesPageIndex', event.pageIndex)
        this.loadRoles()
    }

    deleteConfirmDialog(role_id: number, role: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ROLE.confirm_delete', {"role": role}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.deleteRole(role_id)
            }
        });
    }

    deleteRole(role_id: number){
        let headers = this.authService.headers;
        if (role_id !== undefined){
            this.http.delete(API_URL + '/ws/roles/delete/' + role_id, {headers}).pipe(
                tap((data: any) => {
                    this.loadRoles()
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
        let data = this.roles.slice()
        if(!sort.active || sort.direction === ''){
            this.roles = data
            return;
        }

        this.roles = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label_short': return this.compare(a.label_short, b.label_short, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'editable': return this.compare(a.editable, b.editable, isAsc);
                default: return 0;
            }
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
