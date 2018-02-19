import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import {RouterModule, Routes} from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

import { SinglepageComponent } from './pages/singlepage/singlepage.component';
import { WorkbooksComponent } from './pages/workbooks/workbooks.component';

//Services
import { TableauService, WorkbookInfo } from './services/tableau/tableau.service';
import { ViewsComponent } from './pages/views/views.component';
import { TableauMenuItem } from './components/tableaumenuitem/tableaumenuitem.component';

const appRoutes: Routes =[
  {path:'',component:HomeComponent},
  {path:'about',component:SinglepageComponent},
  {path: 'projects/:projectId/workbooks', component:WorkbooksComponent},
  {path: 'projects/:projectId/workbooks/:workbookId/views',component:ViewsComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SinglepageComponent,
    WorkbooksComponent,
    ViewsComponent,
    TableauMenuItem
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    TableauService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
