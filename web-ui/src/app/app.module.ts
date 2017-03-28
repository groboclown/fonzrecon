import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { AuthGuard } from './_guards/index';
import {
    ApiService, MeService,
    SiteService, LowLoginAccountService
  } from './_services/index';
import { HomeComponent } from './home/index';

import { HeaderModule } from './header/index';
import { LoginModule } from './login/index';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,

    HeaderModule.forRoot(),
    LoginModule.forRoot()
  ],
  providers: [
    AuthGuard,
    ApiService,
    MeService,
    SiteService,
    LowLoginAccountService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
