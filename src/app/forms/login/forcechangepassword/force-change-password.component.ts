import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { LoginService } from '../login.service';
import { CommonService } from '../../../services/common.service';
import { ChangePasswordModel } from '../../../model/ChangePasswordModel';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-force-change-password',
  templateUrl: './force-change-password.component.html'
})
export class ForceChangePasswordComponent implements OnDestroy, OnInit {
  private changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  loading: boolean = false;
  subscriptions: Subscription[] = [];
  peopleId: string;

  constructor(private router: Router, private route: ActivatedRoute,
    private _service: LoginService, private commonService: CommonService) { }

  ngOnInit(): void {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.peopleId = params['id'];
    }));
  }

  changeClick() {
    this.loading = true;
    this.changePasswordModel.Id = this.peopleId;
    this.subscriptions.push(this._service.forceChangePassword(this.changePasswordModel)
      .subscribe(res => {
        this.commonService.setAuthUser(res.Result);
        localStorage.setItem(environment.userTokenKey, res.Result.Token);
        if (res.Result.DefaultURL) {
          this.router.navigateByUrl(res.Result.DefaultURL);
        }
        else {
          this.router.navigateByUrl('user/dashboard');
        }
      },
      err => {
        this.loading = false;
      }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
