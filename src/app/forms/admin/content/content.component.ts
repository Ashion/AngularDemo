import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client/client.service';
import { ChangepasswordComponent } from '../../../components/wrapper/change-password-popup/changepassword.component';

@Component({
  selector: 'admin-content',
  templateUrl: './content.component.html',
  providers: [ClientService]
})
export class ContentComponent {
}
