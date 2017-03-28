import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AuthGuard } from './_guards/index';
import {
    ApiService, UserService, MeService, LoginService,
    SiteService
  } from './_services/index';
import { LoginComponent } from './login/index';
import { HomeComponent } from './home/index';
import { HeaderComponent } from './header/index';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
    AuthGuard,
    ApiService,
    UserService,
    MeService,
    LoginService,
    SiteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
