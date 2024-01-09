import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, TemplateRef, ViewChild, inject } from '@angular/core';
import { Auth, signInAnonymously, updateProfile, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, documentId, getDoc, getDocs, setDoc, writeBatch } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { updateDoc } from 'firebase/firestore';
import { Observable, from, map, of, switchMap, throwError } from 'rxjs';
import { RoomParticipant, RoomService } from '../shared/services/room.service';
import { AuthService } from '../shared/services/auth.service';
import { AdsenseModule } from 'ng2-adsense';
import { SpinnerService } from '../shared/spinner/spinner.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, AdsenseModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RoomComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() roomId: string | null = null;
  @ViewChild("content") modalContent: TemplateRef<any> | undefined;

  roomDetails: Room = { name: 'Before load', hidden: true };

  roomDetails$: Observable<Room> = new Observable();
  participants$: Observable<RoomParticipant[]> = new Observable();
  currentParticipant$: Observable<Participant> = new Observable();

  scoresHidden: boolean = true;

  formGroup: FormGroup;
  participantId: any;


  cards: PokerCard[] = [];

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private modalService: NgbModal = inject(NgbModal);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private roomService: RoomService = inject(RoomService);
  private authService: AuthService = inject(AuthService);
  private spinnerService: SpinnerService = inject(SpinnerService);

  private isBrowser: boolean = false;
  private selectedCard: any;


  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }
  ngOnInit(): void {
    this.roomService.room$.subscribe(details => {
      this.scoresHidden = details?.hidden ?? true
      this.cards = this.buildCardsFromOptionString(details?.options ?? '');
    });

    this.roomService.roomParticipants$.subscribe(participants => {
      const currentParticipant = participants.find(participant => participant.id == this.participantId);
      if (currentParticipant) {
        this.selectedCard = currentParticipant.score;
      }
    });

    this.participants$ = this.roomService.roomParticipants$;
    this.roomDetails$ = this.roomService.room$;

    this.spinnerService.showSpinner();
  }

  async ngOnDestroy() {
    await this.leaveRoom();
  }

  @HostListener('window:beforeunload')
  doSomething() {
    this.leaveRoom()
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }

    this.signIn().pipe(map(participant => from(this.joinRoom(participant)))).subscribe().add(this.spinnerService.hideSpinner());
  }

  isSelected(value: string): boolean {
    return value === this.selectedCard;
  }

  private signIn(): Observable<RoomParticipant> {
    return this.authService.user$.pipe(map(user => {
      if (user) {
        return user
      }

      throw new Error();
    }));

  }

  private async joinRoom(participant: RoomParticipant) {
    if (this.participantId)
        return;

        

    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true
    };

    if (!participant.name && this.auth.currentUser) {
      const modalRef = this.modalService.open(this.modalContent, modalOptions);
      await modalRef.result;

      const displayName = this.formGroup.controls['name'].value;
      participant.name = displayName;
      await updateProfile(this.auth.currentUser, { displayName: displayName });
    }

    this.participantId = participant.id;
    const participantName = participant.name;
    this.roomService.joinRoom(this.roomId, this.participantId, participantName ?? '').subscribe();
  }

  private async leaveRoom() {
    const currentParticipantRef = doc(this.firestore, `/rooms/${this.roomId}/participants/${this.participantId}`);
    deleteDoc(currentParticipantRef);
  }

  updateVote(score: string | null) {
    const currentParticipantRef = doc(this.firestore, `/rooms/${this.roomId}/participants/${this.participantId}`);
    updateDoc(currentParticipantRef, { score: score })
  }

  toggleHiddenScores() {
    const roomRef = doc(this.firestore, `/rooms/${this.roomId}`);
    updateDoc(roomRef, { hidden: !this.scoresHidden });
  }

  resetScores() {
    const roomParticipantsRef = collection(this.firestore, `/rooms/${this.roomId}/participants`);
    getDocs(roomParticipantsRef).then(records => {
      const batch = writeBatch(this.firestore);
      records.forEach(record => batch.update(record.ref, { score: null }));
      batch.commit();
    });
  }

  private buildCardsFromOptionString(optionString: string): PokerCard[] {
    const options = optionString.split(',').map(s => s.trim()).filter(this.validCardOption);
    return options.map<PokerCard>(option => {
      return { value: option };
    });
  }

  private validCardOption(option: string): boolean {
    if (!option) return false;
    return true;
  }


}

export interface PokerCard {
  value: string;
}

export interface Room {
  id?: string;
  name: string;
  options?: string;
  hidden: boolean
}

export interface Participant {
  id?: any;
  name: string;
  score?: string | null;
}
