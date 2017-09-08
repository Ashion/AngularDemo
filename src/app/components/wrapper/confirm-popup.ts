import { Injectable } from '@angular/core';

import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';

@Injectable()
export class ConfirmPopup {

    constructor(private modal: Modal) { }

    openConfirmation(content: string = 'Are you sure?', headerText: string = 'Confirmation', okText: string = 'Yes', cancelText: string = 'No', okBtnClass: string = 'btn btn-orange btn-default', cancelBtnClass: string = 'btn btn-gray btn-default') {
        return this.modal.confirm()
            .title(headerText)
            .body(content)
            .showClose(false)
            .okBtn(okText)
            .cancelBtn(cancelText)
            .okBtnClass(okBtnClass)
            .cancelBtnClass(cancelBtnClass)
            .bodyClass('modal-body text-left')
            .open()
            .then(dialog => dialog.result);
    }
}

// // How to use
//  this._confirm.openConfirmation()
//      .then(res => {
//       // handle Ok click
//      })
//      .catch(err => handle cancel click);
