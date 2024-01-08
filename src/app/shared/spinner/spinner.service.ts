import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  public spinner$: Subject<any> = new Subject();

  constructor() { }

  showSpinner() {
    console.log('Show spinner')
    this.spinner$.next(true);
  }

  hideSpinner() {
    console.log('Hide spinner')
    this.spinner$.next(false);
  }

}
