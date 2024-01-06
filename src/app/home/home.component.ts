import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Room, RoomService } from '../shared/services/room.service';
import { map } from 'rxjs';

const defaultRoom: Room = {
  name: "",
  options: "?,0,1,2,3,5,8,13",
  hidden: true
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: 'home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  private router: Router = inject(Router);
  private roomService: RoomService = inject(RoomService);

  navigateToRoom(roomCode: string) {
    if (roomCode) {
      this.router.navigate(['/room', roomCode, 'poker'])
    }
  }

  async createRoomDefault() {
    await this.roomService.createRoom(defaultRoom).pipe(map(room => {
      this.router.navigate(['/room', room.id, 'poker'])
    })).toPromise();
  }

}
