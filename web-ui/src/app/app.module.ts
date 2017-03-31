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
// import { PagedComponent } from './_directives/index';

import { WidgetsModule } from './widgets/index';
import { HeaderModule } from './header/index';
import { LoginModule } from './login/index';
import { AdminModule } from './admin/index';
import { AaaysModule } from './aaays/index';
import { PagingModule } from './paging/index';
import { HomeModule } from './home/index';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,

    PagingModule.forRoot(),
    HeaderModule.forRoot(),
    WidgetsModule.forRoot(),
    LoginModule.forRoot(),
    AdminModule.forRoot(),
    AaaysModule.forRoot(),
    HomeModule.forRoot()
  ],
  providers: [
    AuthGuard,
    ApiService,
    MeService,
    SiteService,
    LowLoginAccountService
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
