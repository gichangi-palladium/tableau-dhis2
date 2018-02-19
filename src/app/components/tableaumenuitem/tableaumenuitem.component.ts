import { Component, OnInit, Input } from '@angular/core';
import '../../../assets/tableau/tableau-2.min.js';
import { Router } from '@angular/router';
import { ProjectInfo } from '../../services/tableau/tableau.service';


@Component({
  selector: 'tableau-menuitem',
  templateUrl: './tableaumenuitem.component.html',
  styleUrls: ['./tableaumenuitem.component.css']
})
export class TableauMenuItem {
 @Input() project:ProjectInfo;
  isOpen:boolean =false;
 
}

