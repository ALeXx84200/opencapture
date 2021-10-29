import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {UserService} from "./user.service";
import {SettingsService} from "./settings.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public headers : HttpHeaders;

    constructor(
        private router: Router,
        private http: HttpClient,
        private userService: UserService,
        public serviceSettings: SettingsService,
        private localStorage: LocalStorageService,
    ) {
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    }

    generateHeaders() {
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
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

    getTokenCustom(name: string) {
        return this.localStorage.get(name);
    }

    setTokens(token: string, token2: string, daysBeforeExp: number) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken', token, daysBeforeExp);
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token2, daysBeforeExp);
    }

    setTokenAuth(token: string, daysBeforeExp: number) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token, daysBeforeExp);
    }

    getToken() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken');
    }

    clearTokens() {
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken');
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken_2');
        this.localStorage.remove('splitter_or_verifier');
    }

    logout() {
        this.clearTokens();
        this.userService.setUser({});
        this.localStorage.remove('selectedSettings');
        this.localStorage.remove('selectedParentSettings');
        this.router.navigateByUrl("/login").then();
    }
}
