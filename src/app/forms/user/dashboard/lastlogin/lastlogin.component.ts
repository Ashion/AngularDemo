import { Component, OnInit } from '@angular/core';
import { PeopleService } from "app/forms/user/people/people.service";
import { CommonService } from "app/services/common.service";

@Component({
  selector: 'user-lastlogin',
  templateUrl: './lastlogin.component.html',
  styleUrls: ['./lastlogin.component.css']
})
export class LastloginComponent implements OnInit {

  private authUser: any;
  private lastLogin: Date

  constructor(private _peopleService: PeopleService, private _commonService: CommonService) {
    this.authUser = _commonService.AuthUser.getValue();
  }

  ngOnInit() {
    this._peopleService.getPersonById(this.authUser.PeopleId).subscribe(person => {
      this.lastLogin = person.Result.LastLoginDate;
    });
  }
}