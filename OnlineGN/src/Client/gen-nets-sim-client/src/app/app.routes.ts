import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { GenNetPageComponent } from './components/gen-net-page/gen-net-page.component';

// routes
export const APP_ROUTES: Routes = [
  {
    path: '',
    component: GenNetPageComponent,
  },
  {
    path: 'genNets/:genNetId',
    component: GenNetPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
