import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./form-page/form-page').then(m => m.FormPage) },
  { path: 'sign-up', loadComponent: () => import('./sign-up/sign-up').then(m => m.SignUp) },
  { path: 'wallet', loadComponent: () => import('./wallet/wallet').then(m => m.Wallet), canActivate: [AuthGuard] }
];