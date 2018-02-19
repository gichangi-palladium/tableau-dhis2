import { Component, OnInit, Directive, HostListener, HostBinding } from '@angular/core';
import { TableauService, ProjectInfo, Credentials } from './services/tableau/tableau.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  projects:ProjectInfo[];
  constructor(public tableauService:TableauService){}
 
  ngOnInit(){
    this.tableauService.getProjects()
      .then(e=>this.projects = e.filter(e=>!e.parentProjectId))
      .catch(e=>this.tableauService.onTableauError("Failed to load Tableau projects", e));
  }


}

