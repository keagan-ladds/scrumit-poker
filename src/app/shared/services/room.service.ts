import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, deleteDoc, doc, docData, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, map, mergeMap, pipe, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  private room: BehaviorSubject<Room> = new BehaviorSubject<Room>({name: '', hidden: true});
  private roomParticipants: BehaviorSubject<RoomParticipant[]> = new BehaviorSubject<RoomParticipant[]>([]);

  get room$() {
    return this.room.asObservable();
  }

  get roomParticipants$() {
    return this.roomParticipants.asObservable();
  }

  roomExists(id: any): Observable<boolean> {
    const roomRef = doc(this.firestore, `/rooms/${id}`);
    return from(getDoc(roomRef)).pipe(map(room => room.exists()));
  }

  getRoomById(id: any): Observable<Room> {
    const roomRef = doc(this.firestore, `/rooms/${id}`);
    return (docData(roomRef, { idField: 'id' }) as Observable<Room>).pipe(switchMap(room => this.getRoomParticipants(id).pipe(map(() => {
      this.room.next(room);
      return room;
    }))));
  }

  getRoomParticipants(id: any): Observable<RoomParticipant[]> {
    console.log("Getting room participants");
    const roomParticipantsRef = collection(this.firestore, `/rooms/${id}/participants`);
    return (collectionData(roomParticipantsRef, {idField: 'id'}) as Observable<RoomParticipant[]>).pipe(map(participants => {
      this.roomParticipants.next(participants);
      return participants;
    }));
  }

  joinRoom(roomId: any, participantId: any, participantName: string): Observable<Room> {
    const currentParticipantRef = doc(this.firestore, `/rooms/${roomId}/participants/${participantId}`);

    return from(getDoc(currentParticipantRef)).pipe(mergeMap((participant => {
      const action = participant.exists() ? updateDoc(currentParticipantRef, {
        name: participantName
      }) : setDoc(currentParticipantRef, {
        name: participantName
      });

      return from(action).pipe(mergeMap(() => {
        return this.getRoomById(roomId);
      }));
    })));
  }

  createRoom(room: Room): Observable<Room> {
    const collectionRef = collection(this.firestore, `/rooms`);
    const roomRef = doc(collectionRef);
    return from(setDoc(roomRef, room)).pipe(map(() => {
      room.id = roomRef.id;
      return room
    }));
  }

  async createRoomDefault() {
    await this.createRoom(defaultRoom).pipe(map(room => {
      this.router.navigate(['/room', room.id, 'poker'])
    })).toPromise();
  }

  // leaveRoom() {
  //   const currentParticipantRef = doc(this.firestore, `/rooms/${this.roomId}/participants/${this.participantId}`);
  //   deleteDoc(currentParticipantRef);
  // }

  constructor() { }

}

export interface Room {
  id?: string;
  name: string;
  options?: string;
  hidden: boolean
}

export interface RoomParticipant {
  id?: any;
  name: string | null;
  score?: string | null;
}

const defaultRoom: Room = {
  name: "",
  options: "?,0,1,2,3,5,8,13",
  hidden: true
};
