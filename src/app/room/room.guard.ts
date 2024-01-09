import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { RoomService } from '../shared/services/room.service';
import { map } from 'rxjs';



export const roomGuard: CanActivateFn = (route, state) => {
  const roomService = inject(RoomService)
  const router = inject(Router);
  const roomId = route.paramMap.get('roomId');
  return roomService.roomExists(roomId).pipe(map(exists => {
    if (!exists) {
      router.navigate(['/']);
    }
    return exists;
  }))
};
