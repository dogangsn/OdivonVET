import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from './model/Activity';

@Component({
  selector: 'app-myactivities',
  templateUrl: './myactivities.component.html',
  styleUrls: ['./myactivities.component.css']
})
export class MyactivitiesComponent implements OnInit {

  activities$: Observable<Activity[]>;
  
  constructor() { }

  ngOnInit() {
  }

}
