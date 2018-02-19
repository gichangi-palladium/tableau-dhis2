import { Component, OnInit } from '@angular/core';
declare var tableau: any;
import '../../../assets/tableau/tableau-2.min.js';
@Component({
  selector: 'app-singlepage',
  templateUrl: 'singlepage.component.html',
  styleUrls: ['singlepage.component.css']
})
export class SinglepageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    var containerDiv = document.getElementById("main-chart2"),
      //url = "http://pathazutabsrv01.cloudapp.net/views/RMNCAHExplorationforReview/RHSubCountyDashboard?:embed=y&:display_count=no&:showAppBanner=false&:showShareOptions=true&:showVizHome=no",
      url = "http://pathazutabsrv01.cloudapp.net/views/90-90-90DashboardAPHIAplus/90-90-90Cascade?:embed=y&:showAppBanner=false&:showShareOptions=true&:display_count=no&:showVizHome=no",
      options = {
        width: containerDiv.offsetWidth,
        height: containerDiv.offsetHeight,
        hideTabs: false,
        hideToolbar:false,
        onFirstInteractive: function () {
          console.log("Run this code when the viz has finished loading.");
          var workbook = viz.getWorkbook();
          var activeSheet = workbook.getActiveSheet();
          console.log(activeSheet.getName());

        }
      };

    var viz = new tableau.Viz(containerDiv, url, options);
    viz.setFrameSize('500px', '500px');
  }

}
