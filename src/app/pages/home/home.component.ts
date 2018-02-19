import { Component, OnInit } from '@angular/core';
import '../../../assets/tableau/tableau-2.min.js';
import { TableauService, ProjectInfo } from '../../services/tableau/tableau.service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-homedashboard',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  projects: TableauProject[];
  private projectsbg: String[]=[
    'bg-primary',
    'bg-success',
    'bg-info',
    'bg-warning',
    'bg-danger',
    'bg-light'
  ];

  constructor(public tableauService:TableauService, public router:Router) {
  }

  ngOnInit(){
    this.tableauService.getProjects().then(e=>{
      let casted: TableauProject[] = e.map(t=><TableauProject><ProjectInfo>t);
      casted.forEach((p:TableauProject,index:number)=>{
        p.bgcolor = this.projectsbg[index % this.projectsbg.length];
      });
      //set list
      this.projects= casted;
    });
  }


  goToWorkbookPage(projectId:string){
    this.router.navigate(['/projects', projectId, 'workbooks']);
  }

}

interface TableauProject extends ProjectInfo{
  bgcolor: String
}
