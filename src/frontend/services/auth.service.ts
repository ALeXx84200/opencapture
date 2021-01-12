import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";
import { API_URL } from '../app/env';
import {of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: any = {
        username: '',
        firstname: '',
        lastname: '',
        role: '',
        creation_date: '',
        enabled: '',
        status: '',
        groups: [],
        privileges: [],
        preferences: []
    };
    public headers : HttpHeaders;

    constructor(
        private http: HttpClient,
        private localStorage: LocalStorageService,
    ) {
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken())
    }

    setCachedUrl(url: string) {
        this.localStorage.save('OpenCaptureForInvoicesCachedUrl', url);
    }

    getCachedUrl() {
        return this.localStorage.get('OpenCaptureForInvoicesCachedUrl');
    }

    cleanCachedUrl() {
        return this.localStorage.remove('OpenCaptureForInvoicesCachedUrl');
    }

    cleanUrl(id: number) {
        return this.localStorage.remove(`OpenCaptureForInvoicesUrl_${id}`);
    }

    getUrl(id: number) {
        return this.localStorage.get(`OpenCaptureForInvoicesUrl_${id}`);
    }

    setUrl(url: string) {
        const arrUrl = url.split('/');

        if (arrUrl.indexOf('resources') === -1 && arrUrl.indexOf('content') === -1) {
            let token = this.getToken()
            if (token){
                this.localStorage.save(`OpenCaptureForInvoicesUrl_${JSON.parse(atob(token.split('.')[1])).user.id}`, url);
            }
        }
    }

    setTokenCustom(name: string, token: string) {
        this.localStorage.save(name, token);
    }

    getTokenCustom(name: string){
        return this.localStorage.get(name);
    }


    setTokens(token: string, token2: string) {
        this.localStorage.save('OpenCaptureForInvoicesToken', token);
        this.localStorage.save('OpenCaptureForInvoicesToken_2', token2);
    }

    setTokenAuth(token: string){
        this.localStorage.save('OpenCaptureForInvoicesToken_2', token);
    }

    getToken() {
        return this.localStorage.get('OpenCaptureForInvoicesToken');
    }

    getTokenAuth() {
        return this.localStorage.get('OpenCaptureForInvoicesToken_2');
    }

    clearTokens() {
        this.localStorage.remove('OpenCaptureForInvoicesToken');
        this.localStorage.remove('OpenCaptureForInvoicesToken_2');
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser(){
        return this.user
    }

    logout(){
        if (this.getToken() !== null ) {
            let token = this.getToken()
            if (token){
                if (JSON.parse(atob(token.split('.')[1])).user) {
                    this.cleanUrl(JSON.parse(atob(token.split('.')[1])).user.id);
                }
            }
        }
        this.setUser({});
        this.clearTokens();
    }

}
