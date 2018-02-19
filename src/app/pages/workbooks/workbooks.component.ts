import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import '../../../assets/tableau/tableau-2.min.js';
import { AppComponent } from '../../app.component';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TableauService, WorkbookInfo, ProjectInfo } from '../../services/tableau/tableau.service';

@Component({
  selector: 'app-workbooks',
  templateUrl: './workbooks.component.html',
  styleUrls: ['./workbooks.component.css']
})
export class WorkbooksComponent implements OnInit, OnDestroy{
  private sub:any;
  workbooks:WorkbookInfo[] = [];
  projectId:string;
  projectName:string;
  constructor(private route:ActivatedRoute, private tableauService:TableauService, private router:Router){}
  ngOnInit(){
    //subscribe for incoming parameter change
    this.sub = this.route.params.subscribe(p=>{
      console.debug("loading workbooks of project id: " + p['projectId']);
      this.projectId = p['projectId'];
      this.tableauService.getWorkbooks(p['projectId'])
        .then(workbooks=> this.workbooks = workbooks)
        .catch(e=> this.tableauService.onTableauError('Failed to get Workbooks for selected project', e));
      //get the name of current project
      this.tableauService.getProjects().then(projects=>{
        projects.forEach(project=>{
          if(project.id === p['projectId'])
            this.projectName= project.name;
        });
      })
    }); 
  
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }

}
interface TableauWorkbookInfo extends WorkbookInfo{
  bgcolor:string
}

