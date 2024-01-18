import { Injectable } from '@angular/core';

declare var gtag: any;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor() { }

  logEvent(name: string) {
    if (gtag) {
      gtag('event', name, {});
    }
  }

}

export class EventTypes {
  static readonly CreateRoom = 'create_room';
  static readonly JoinRoom = 'join_room';
}
