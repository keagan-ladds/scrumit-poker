import { Routes } from '@angular/router';
import { roomGuard } from './room/room.guard';
import { roomResolver } from './room/room.resolver';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home/home.component').then(module => module.HomeComponent) },
    { path: 'room/:roomId/poker', loadComponent: () => import('./room/room.component').then(module => module.RoomComponent), canActivate: [roomGuard], resolve:[roomResolver] }];
