import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { DocumentData, Firestore, collection, collectionData, deleteDoc, doc, docData, getDoc, getDocs, setDoc, updateDoc, writeBatch } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineAll, combineLatest, combineLatestAll, combineLatestWith, forkJoin, from, map, mergeMap, pipe, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);


  roomExists(id: any): Observable<boolean> {
    const roomRef = doc(this.firestore, `/rooms/${id}`);
    return from(getDoc(roomRef)).pipe(map(room => room.exists()));
  }


  private addParticipantToRoom(roomId: any, participant: { id: any, name: string }): Observable<any> {
    const participantRef = doc(this.firestore, `/rooms/${roomId}/participants/${participant.id}`);
    return from(getDoc(participantRef)).pipe(mergeMap(existingParticipant => {
      if (existingParticipant.exists()) {
        return updateDoc(participantRef, {
          name: participant.name
        });
      } else {
        return setDoc(participantRef, {
          name: participant.name
        });
      }
    }))
  }

  joinRoomV2(roomId: any, participant: { id: any, name: string }): Observable<Room> {
    const roomRef = doc(this.firestore, `/rooms/${roomId}`);
    const roomParticipantsRef = collection(this.firestore, `/rooms/${roomId}/participants`);

    const room$ = docData(roomRef, { idField: 'id' }) as Observable<Room>;
    const participant$ = collectionData(roomParticipantsRef, { idField: 'id' }) as Observable<RoomParticipant[]>;

    return this.addParticipantToRoom(roomId, participant).pipe(mergeMap(() => {
      return combineLatest([room$, participant$]).pipe(map(([room, participants]) => {
        room.participants = participants;
        return room;
      }))
    }))
  }

  updateVote(roomId: any, participantId: any,  score: string | null) {
    const currentParticipantRef = doc(this.firestore, `/rooms/${roomId}/participants/${participantId}`);
    updateDoc(currentParticipantRef, { score: score })
  }

  toggleHiddenScores(roomId: any, hidden: boolean) {
    const roomRef = doc(this.firestore, `/rooms/${roomId}`);
    updateDoc(roomRef, { hidden: hidden });
  }

  resetScores(roomId: any) {
    const roomParticipantsRef = collection(this.firestore, `/rooms/${roomId}/participants`);
    getDocs(roomParticipantsRef).then(records => {
      const batch = writeBatch(this.firestore);
      records.forEach(record => batch.update(record.ref, { score: null }));
      batch.commit();
    });
  }


  createRoom(room: Room): Observable<Room> {
    const collectionRef = collection(this.firestore, `/rooms`);
    const roomRef = doc(collectionRef);
    return from(setDoc(roomRef, room)).pipe(map(() => {
      room.id = roomRef.id;
      return room
    }));
  }

  createRoomDefault(): Observable<void> {
    return this.createRoom(defaultRoom).pipe(map(room => {
      this.router.navigate(['/room', room.id, 'poker'])
    }))
  }

  navigateToRoom(roomCode: string, errorCallback?: (error: string) => void): Observable<void> {
    return this.roomExists(roomCode).pipe(map(exists => {
      if (exists) {
        this.router.navigate(['/room', roomCode, 'poker'])
      } else {
        if (errorCallback) {
          errorCallback("The room does not exist");
        }
      }
    }));
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
  hidden: boolean;
  participants?: RoomParticipant[];
}

export interface RoomParticipant {
  id?: any;
  name: string | null;
  score?: string | null;
}

const defaultRoom: Room = {
  name: "",
  options: "?,0,0.5,1,2,3,5,8,13,20,40,100",
  hidden: true
};
