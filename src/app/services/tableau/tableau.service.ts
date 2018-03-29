import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod, ResponseContentType } from '@angular/http';
import urljoin from "url-join";
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class TableauService{

    constructor(public http:Http, public router:Router){ 
    }

    //replace with appropriate error handling
    onTableauError(msg:string, err:any){
        console.error(msg + '\r\n' + err);
        alert(msg + '\r\n' +err);
        //use router to navigate to an errorpage if required
        
    }
    //the following properties act as a cache layer. Their values get filled with the first request, and is provided for subsequent requests
    private _tableauLogin: Promise<Credentials> = null;
    private _projects: Promise<ProjectInfo[]> = null;
    private _workbooksPerProjectId: Map<string,Promise<WorkbookInfo[]>> = new Map<string,Promise<WorkbookInfo[]>>();
    private _viewsPerWorkbookId: Map<string,Promise<ViewInfo[]>> = new Map<string,Promise<ViewInfo[]>>();;
  
    //basic http request that attaches Tableau specific headers
    private _baseTableauRequest(relativeUrl:string,method:RequestMethod, responseType:ResponseContentType, credential?:Credentials,body?:any):Observable<Response>{
        const headers: Headers = new Headers();
        headers.append('async', 'true');
        headers.append('Content-Type', 'application/json');
        headers.append("Accept", "application/json");
        if (credential){
            headers.append('X-Tableau-Auth',credential.token);
        }
        const options = new RequestOptions({
            headers: headers,
            method: method,
            body:body,
            url: urljoin(environment.backendUrl, relativeUrl),
            responseType: responseType
          });
        return this.http.request(options.url, options);
    }
    //tableau API request (expects json)
    private tableauRequest(relativeUrl:string,method:RequestMethod, credential?: Credentials
        ,body?:any):Promise<any>{
     
       return this._baseTableauRequest(relativeUrl, method, ResponseContentType.Json, credential, body).toPromise().then(e=>e.json());
    }

    //returns stored credentials or requests new credentials. CAlled by service automatically.
    private tableauLogin():Promise<Credentials>{
        if (this._tableauLogin != null){
            return this._tableauLogin;
        }
        console.debug("Logging in to Tableau Server")
        return this._tableauLogin = this.tableauRequest('auth/signin', RequestMethod.Post, null, {
            credentials: {
              name:environment.userName,
              password: environment.password,
              site: {
                contentUrl: environment.siteContentUrl
              }
            }
          }).then(e=>{
            console.debug("Tableau server login complete");
              return {
                  token:e.credentials.token,
                  site:e.credentials.site.id
              };
          });
    }
    //returns stored projects or requests projects
    getProjects():Promise<ProjectInfo[]>{
        if (this._projects!=null){
            return this._projects;
        }
        console.debug("Retrieving Tableau Server Projects");
        return this._projects = this.tableauLogin().then(c=>{
            return this._getProjects(1, c, new Map<string,ProjectInfo>());
        });
    }
    //internal recursive method to get all projects
    private _getProjects(page:number, credentials:Credentials, rollingResults: Map<string,ProjectInfo>):Promise<ProjectInfo[]>{
        console.debug("Retrieving projects from page " + page + "...");
        return this.tableauRequest('sites/' + credentials.site + '/projects?pageSize=1000&pageNumber=' + page, RequestMethod.Get, credentials)
            .then(e=>{
                for (let i = 0; i< e.projects.project.length; i++){
                    let item: ProjectInfo =  <ProjectInfo><any>e.projects.project[i];
                    item.childProjects = [];
                    rollingResults.set(e.projects.project[i].id, item);
                }
                if (e.pagination.pageNumber * e.pagination.pageSize < e.pagination.totalAvailable){
                    return this._getProjects(page+1, credentials, rollingResults);
                }
                else{
                    console.debug("Retrieved all projects (" + rollingResults.size + "). Building project tree");
                    var ret = new Map<string,ProjectInfo>(rollingResults);
                    //We assign child projects to their parents.
                    rollingResults.forEach((value:ProjectInfo,key:string)=>{
                        if (value.parentProjectId){
                            ret.get(value.parentProjectId).childProjects.push(value);
                        }
                    });
                    console.debug('Assigned child projects. Top level project count: ' + ret.size);
                    return Promise.resolve(Array.from(ret.values()));
                }
              
            });
           
    }
    //returns stored workbooks for specified project if exist, or requests workboks for project
    getWorkbooks(projectId:string):Promise<WorkbookInfo[]>{
        if (this._workbooksPerProjectId.has(projectId)){
            return this._workbooksPerProjectId.get(projectId);
        }
        this._workbooksPerProjectId.set(projectId, this.tableauLogin().then(c=>this._getWorkbooks(1,projectId,c, [])));
        return this._workbooksPerProjectId.get(projectId);
    }
    //internal recursive method to get all workbooks
    private _getWorkbooks(page:number, projectId:string, credentials: Credentials, rollingResults: WorkbookInfo[]):Promise<WorkbookInfo[]>{
        console.debug("Retrieving workbooks from page " + page + "...");
        return this.tableauRequest('sites/' + credentials.site + '/workbooks?pageSize=1000&pageNumber=' + page,
            RequestMethod.Get, credentials).then(e=>{
                for (let i = 0;i< e.workbooks.workbook.length;i++){
                    let item: WorkbookInfo = <WorkbookInfo><any>e.workbooks.workbook[i];
                    if (e.workbooks.workbook[i].project.id != projectId){
                        continue;
                    }
                    this._loadWorkbookImage(item, credentials);
                    rollingResults.push(item);
                }
                if (e.pagination.pageNumber * e.pagination.pageSize < e.pagination.totalAvailable){
                    return this._getWorkbooks(page+1, projectId,credentials, rollingResults);
                }
                else{
                    console.debug("Retrieved all workbooks (" + rollingResults.length + ") from projectid: (" + projectId + ")");
                    return Promise.resolve(rollingResults);
                }
               
            });
            
    }
    private _loadWorkbookImage(workbook:WorkbookInfo, credentials:Credentials){
        this._baseTableauRequest('sites/' + credentials.site + '/workbooks/' + workbook.id + '/PreviewImage', RequestMethod.Get, ResponseContentType.Blob, credentials)
            .toPromise().then(e=>{
                let reader = new FileReader();
                reader.addEventListener("load", ()=>{
                    workbook.img = reader.result;
                });
                reader.readAsDataURL(e.blob());
            })
    }

    //returns stored views for specified workbook if exist, or requests views for workbook
    getViews(workbookId:string):Promise<ViewInfo[]>{
        if (this._viewsPerWorkbookId.has(workbookId)){
            return this._viewsPerWorkbookId.get(workbookId);
        }
        console.debug("Retrieving views for workbook id: "+ workbookId);
        this._viewsPerWorkbookId.set(workbookId, this.tableauLogin().then(credentials=>{
            return this.tableauRequest('sites/' + credentials.site + '/workbooks/' + workbookId + '/views', RequestMethod.Get, credentials).then(e=>{
                let ret :ViewInfo[]= Array.from(<ViewInfo[]><any>e.views.view);
                ret.forEach(r=>this._loadViewImage(workbookId,r, credentials));
                return ret;
            })
        }));
        return this._viewsPerWorkbookId.get(workbookId);
    }
    
    private _loadViewImage(workbookId:string,view:ViewInfo, credentials:Credentials){
        this._baseTableauRequest('sites/' + credentials.site + '/workbooks/' + workbookId + '/Views/' +view.id + '/previewImage', RequestMethod.Get, ResponseContentType.Blob, credentials)
            .toPromise().then(e=>{
                let reader = new FileReader();
                reader.addEventListener("load", ()=>{
                    view.img = reader.result;
                });
                reader.readAsDataURL(e.blob());
            })
    }
    

}
export interface Credentials{
    token: string,
    site: string
  }

export interface ProjectInfo{
    id:string,
    name:string,
    description:string,
    parentProjectId?:string,
    childProjects:ProjectInfo[]
}
export interface WorkbookInfo{
    id:string,
    name:string,
    contentUrl:string,
    img:string
}

export interface ViewInfo{
    id:string,
    name:string,
    contentUrl:string,
    img:string
}
