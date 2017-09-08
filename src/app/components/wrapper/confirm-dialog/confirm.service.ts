import { Injectable } from "@angular/core";

@Injectable()
export class ConfirmService {
  public activate(message?: string, title?: string) {
    return new Promise<boolean>((resolve, reject) => {
      console.log('test');
    });
  }
}