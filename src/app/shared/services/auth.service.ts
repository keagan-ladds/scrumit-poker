import { Injectable, inject } from '@angular/core';
import { RoomParticipant } from './room.service';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private user: BehaviorSubject<RoomParticipant | null> = new BehaviorSubject<RoomParticipant | null>(null);

  get user$() {
    return this.user.asObservable();
  }

  constructor() { }

  signIn(): Observable<RoomParticipant> {
    if (this.auth.currentUser) {
      const participant = { id: this.auth.currentUser.uid, name: this.auth.currentUser.displayName };
      this.user.next(participant);
      return of(participant);
    }

    return from(signInAnonymously(this.auth)).pipe(map(creds => {
      const participant = { id: creds.user.uid, name: creds.user.displayName };
      this.user.next(participant);
      return participant
    }));

  }

}
