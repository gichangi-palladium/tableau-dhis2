function initViz() {
  console.log('started');
  var containerDiv = document.getElementById("main-chart"),
    //url = "http://pathazutabsrv01.cloudapp.net/views/RMNCAHExplorationforReview/RHSubCountyDashboard?:embed=y&:display_count=no&:showAppBanner=false&:showShareOptions=true&:showVizHome=no",
    url = "http://pathazutabsrv01.cloudapp.net/views/90-90-90DashboardAPHIAplus/90-90-90Cascade?:embed=y&:showAppBanner=false&:showShareOptions=true&:display_count=no&:showVizHome=no",
    options = {
      width: containerDiv.offsetWidth,
      height: containerDiv.offsetHeight,
      hideTabs: false,
      hideToolbar:false,
      onFirstInteractive: function () {
        console.log("Run this code when the viz has finished loading.");

      }
    };

  var viz = new tableau.Viz(containerDiv, url, options);
  // Create a viz object and embed it in the container div.

  var containerDiv = document.getElementById("dashboard2"),
    url = "http://pathazutabsrv01.cloudapp.net/views/RMNCAHExplorationforReview_0/RHSubCountyDashboard?:embed=y&:showAppBanner=false&:showShareOptions=true&:display_count=no&:showVizHome=no",
    //url = "http://pathazutabsrv01.cloudapp.net/views/90-90-90DashboardAPHIAplus/90-90-90Cascade?:embed=y&:display_count=no&:showAppBanner=false&:showShareOptions=true&:showVizHome=no",
    options = {
      width: containerDiv.offsetWidth,
      height: containerDiv.offsetHeight,
      hideTabs: false,
      hideToolbar:false,
      onFirstInteractive: function () {
        console.log("Run this code when the viz has finished loading.");
      }
    };

  var viz = new tableau.Viz(containerDiv, url, options);
  // Create a viz object and embed it in the container div.


  var containerDiv = document.getElementById("dashboard3"),
    url = "http://pathazutabsrv01.cloudapp.net/views/Malaria2014-2017/CasesandReportingMaps?:embed=y&:showAppBanner=false&:showShareOptions=true&:display_count=no&:showVizHome=no",
    options = {
      width: containerDiv.offsetWidth,
      height: containerDiv.offsetHeight,
      hideTabs: true,
      hideToolbars:true,
      onFirstInteractive: function () {
        console.log("Run this code when the viz has finished loading.");
      }
    };

  var viz = new tableau.Viz(containerDiv, url, options);

}
