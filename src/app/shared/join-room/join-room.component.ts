import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { RoomService } from '../services/room.service';
import { SpinnerService } from '../spinner/spinner.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { AlertService } from '../alert/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService, EventTypes } from '../services/analytics.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinRoomComponent {
  private roomService: RoomService = inject(RoomService);
  private _spinnerService: SpinnerService = inject(SpinnerService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _alertService: AlertService = inject(AlertService);
  private _analyticsService: AnalyticsService = inject(AnalyticsService);

  private modalService: NgbModal = inject(NgbModal);

  roomCodeControl = new FormControl('');

  @ViewChild("content") modalContent: TemplateRef<any> | undefined;

  /**
   *
   */
  constructor() {
    this.roomCodeControl.valueChanges.subscribe(() => this.hasError = false);
    this._alertService.error("Could not find room");
  }


  hasError: boolean = false

  navigateToRoom(roomCode: string) {
    this._analyticsService.logEvent(EventTypes.JoinRoom);
    if (roomCode) {
      this._spinnerService.showSpinner();
      this.roomService.navigateToRoom(roomCode, error => {
        this.hasError = true;
        this._changeDetectorRef.markForCheck();
        this.roomCodeControl.setValue('', { emitEvent: false });
        this.modalService.open(this.modalContent, {centered: true});
      }).subscribe().add(() => this._spinnerService.hideSpinner());
    }
  }
}
