import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "./auth/auth.guard";
import { MainComponent } from "./main/main.component";

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [AuthGuard]},
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(x => x.AuthModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {

}
