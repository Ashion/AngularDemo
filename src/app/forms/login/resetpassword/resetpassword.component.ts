import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginService } from '../login.service';
import { ResetPasswordModel } from '../../../model/ResetPasswordModel';
import { NotifyService } from '../../../services/notification.service';

@Component({
    selector: 'app-resetpassword',
    templateUrl: './resetpassword.component.html'
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
    resetmodel: ResetPasswordModel = new ResetPasswordModel();
    loading = false;
    subscriptions: Subscription[] = [];
    cacheKey: string;
    changeSuccess: boolean = false;

    constructor(private router: Router, private route: ActivatedRoute, private LoginService: LoginService,
        private _notify: NotifyService) { }

    ngOnInit(): void {

        this.subscriptions.push(this.route.params.subscribe(params => {
            this.cacheKey = params['cacheKey'];
        }));
        if (!this.cacheKey) {
            this._notify.error('Invalid reset link');
            this.router.navigate(['/login']);
        }

        this.subscriptions.push(this.LoginService.varifyResetLink(this.cacheKey).subscribe(res => {

            if (res.StatusCode == 200) {
                this.resetmodel.Id = res.Result.Id;
                this.resetmodel.UserName = res.Result.Username;
            }
        }, err => {
            this.router.navigate(['/login']);
            this.loading = false;
        }));
    }

    resetClick() {

        this.resetmodel.CacheKey = this.cacheKey;
        this.loading = true;
        this.subscriptions.push(this.LoginService.resetPassword(this.resetmodel).subscribe(res => {
            if (res.StatusCode == 200) {
                this._notify.success('Password change successfully');
                this.loading = false;
                this.changeSuccess = true;
            }
        },
            err => {
                this.loading = false;
            }))
    }

    backtoSignin() {
        this.router.navigate(['/login']);
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}