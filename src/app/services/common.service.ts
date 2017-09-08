import { Injectable } from '@angular/core';

//import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CommonService {
    public AuthUser = new BehaviorSubject(null);
    public userIp: any;

    public newAnnouncement = new BehaviorSubject(null);

    setAuthUser(obj) {
        this.AuthUser.next(obj); //new Observable(observer => observer.next(obj));
    }

    setUserIP(ip) {
        this.userIp = ip;
    }

    setNewAnnouncement(announcement) {
        this.newAnnouncement.next(announcement);
    }
}