import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: any = {};
    public headers : HttpHeaders;

    constructor(
        private router: Router,
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

    setTokenCustom(name: string, token: string) {
        this.localStorage.save(name, token);
    }

    getTokenCustom(name: string){
        return this.localStorage.get(name);
    }

    setTokens(token: string, token2: string, days_before_exp: number) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken', token, days_before_exp)
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token2, days_before_exp)
    }

    setTokenAuth(token: string, days_before_exp: number){
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token, days_before_exp);
    }

    getToken() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken');
    }

    getTokenAuth() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken_2');
    }

    clearTokens() {
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken');
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken_2');
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser(){
        return this.user
    }

    logout(){
        this.setUser({});
        this.clearTokens();
        this.router.navigateByUrl("/login")
    }
}
