import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  public spinner$: Subject<any> = new Subject();

  constructor() { }

  showSpinner() {
    this.spinner$.next(true);
  }

  hideSpinner() {
    this.spinner$.next(false);
  }

}
