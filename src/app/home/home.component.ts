import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Room, RoomService } from '../shared/services/room.service';
import { map } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { SpinnerService } from '../shared/spinner/spinner.service';
import { AnalyticsService, EventTypes } from '../shared/services/analytics.service';

const defaultRoom: Room = {
  name: "",
  options: "?,0,1,2,3,5,8,13",
  hidden: true
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, SharedModule
  ],
  templateUrl: 'home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  private router: Router = inject(Router);
  private roomService: RoomService = inject(RoomService);
  private _spinnerService: SpinnerService = inject(SpinnerService);
  private _analyticsService: AnalyticsService = inject(AnalyticsService);

  createRoomDefault() {
    this._spinnerService.showSpinner();
    this.roomService.createRoomDefault().subscribe().add(this._spinnerService.hideSpinner());
    this._analyticsService.logEvent(EventTypes.CreateRoom);
  }

}
