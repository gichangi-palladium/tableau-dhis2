import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import '../../../assets/tableau/tableau-2.min.js';
import { AppComponent } from '../../app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TableauService, WorkbookInfo, ViewInfo, ProjectInfo } from '../../services/tableau/tableau.service';
import { WorkbooksComponent } from '../workbooks/workbooks.component';
import urljoin from "url-join";

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.css']
})
export class ViewsComponent implements OnInit, OnDestroy{
    private sub:any;
    views:ViewInfo[];
    workbookId:string;
    projectId: string;
    workbook:WorkbookInfo;
    project:ProjectInfo;
  constructor(private route:ActivatedRoute, private tableauService:TableauService, private router:Router){}
  ngOnInit(){
    //subscribe for incoming parameter change
    this.sub = this.route.params.subscribe(p=>{
        this.projectId = p['projectId'];
        this.workbookId = p['workbookId'];
        console.debug("loading views of workbook id: " + this.workbookId + ", project id: " + this.projectId);
        this.tableauService.getProjects().then(projects=>{
            projects.forEach(p=>{
                if (p.id === this.projectId)
                    this.project = p;
            });
        })
        this.tableauService.getWorkbooks(this.projectId).then(workbooks=>{
            workbooks.forEach(w=>{
                if (w.id === this.workbookId)
                    this.workbook = w;
            });
        });

        this.tableauService.getViews(this.workbookId).then(e=>{
            this.views =e;
            console.debug("Retrieved " + e.length + " views");
        }).catch(err=>this.tableauService.onTableauError('Failed to get views for workbook', err));
    });
    
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  goToView(viewContentUrl:string){
      //navigate in current window
      window.location.href = urljoin(this.tableauService.viewDisplayBaseUrl, this.workbook.contentUrl, viewContentUrl.substr(viewContentUrl.lastIndexOf("/")+1));
      //open new window
      //let w = window.open(urljoin(this.tableauService.viewDisplayBaseUrl, this.workbook.contentUrl, viewContentUrl.substr(viewContentUrl.lastIndexOf("/")+1)));

  }

}
interface TableauWorkbookInfo extends WorkbookInfo{
  bgcolor:string
}

