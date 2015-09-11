(function(window, undefined) {'use strict';


angular.module('adf.widget.chart', ['adf.provider', 'angular-c3'])
  .config(["dashboardProvider", function(dashboardProvider){

    dashboardProvider
      .widget('chart', {
        title: 'Chart C3',
        description: 'Displays chart from JSON',
        templateUrl: '{widgetsPath}/chart/src/view.html',
        controller: 'chartCtrl',
        edit: {
          templateUrl: '{widgetsPath}/chart/src/edit.html'
        },
        resolve: {
          feed: ["jsonChartService", "config", function(jsonChartService, config){
            if (config.url){
              return jsonChartService.get(config.url);
            }
          }]
        }       
      })
/*      
      .widget('chartcustom', {
        title: 'Chart custom',
        description: 'Displays custom chart from JSON',
        templateUrl: '{widgetsPath}/chart/src/view-custom.html',
        controller: 'chartCustomCtrl',
        edit: {
          templateUrl: '{widgetsPath}/chart/src/edit-custom.html'
        },
        resolve: {
          feed: function(jsonChartService, config){
            if (config.url){
              return jsonChartService.get(config.url);
            }
          }
        }       
      })
*/
      .widget('drupalchart', {
        title: 'Chart Drupal',
        description: 'Displays chart from JSON',
        templateUrl: '{widgetsPath}/chart/src/view.html',
        controller: 'chartCtrl',
        edit: {
          templateUrl: '{widgetsPath}/chart/src/edit.html'
        },
        resolve: {
          feed: ["jsonDrupalService", "config", function(jsonDrupalService, config){
            if (config.url){
              return jsonDrupalService.get(config.url);
            }
          }]
        }       
      });
  }])
  .controller('chartCtrl', ["$scope", "feed", "config", function($scope, feed, config){

    if (feed){   

      var trendColor = '#90A4AE';
      var trendDiff = feed[Math.floor(feed.length/2)].trend - feed[Math.floor(feed.length/2)-1].trend;
      if(trendDiff > config.trendtolerance || !config.trendtolerance) {
      	if((trendDiff > 0 && !config.trendinverse) || (trendDiff < 0 && config.trendinverse)) {
			trendColor = '#8BC34A';
      	} else {
      		trendColor = '#F44336';
      	}
      }

      switch(config.type) {  
        case "bar":
          $scope.config = {
            data: {
              json: feed,
              type: config.type,
              keys: {
                x : 'name',
                value: ['value']
              }
            },
            axis: {
              x: {
                type: 'category',
                tick: {
                  outer: false
                }
              },
              y: {
                tick: {
                  outer: false
                }
              },
              rotated: config.rotated
            },
            color: {pattern: ['#90A4AE', '#ECEFF1', '#263238']}
          };
        break;

        default: // line and spline chart

          $scope.config = {
            data: {
              json: feed,
              type: config.type,
              keys: {
                x: 'name',
                value: ['trend','value']
              },
              colors: {
            	trend: trendColor,
              }
            },
            axis: {
              y: {
                tick: {
                  count: 5,
                  format: d3.format(".3n"),
                  outer: false
                }
              },
              x: {

                tick: {
                  outer: false
                }
              }
            },
            color: {pattern: ['#ECEFF1', '#90A4AE', '#263238']},
            padding: {top: 8},
          };
        break;
      }

      if (config.timeseries) {
        $scope.config.axis.x.type = 'timeseries';
        $scope.config.axis.x.tick.format = d3.time.format("%d %b %y");
        $scope.config.axis.x.tick.count = 6;
      }

      $scope.config.size = {height: config.height ? config.height : "240"};
      $scope.config.legend = {show: config.showLegend ? config.showLegend : false};
      $scope.config.tooltip = {show: config.showTooltip ? config.showTooltip : false};
    }
  }])
  .controller('chartCustomCtrl', ["$scope", "feed", "config", function($scope, feed, config){

    // idea: enable pure d3 code to be entered and to be rendered
    if (feed){ 
    	$scope.config.code = config.code;
    }

  }]);

angular.module("adf.widget.chart").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/chart/src/edit-custom.html","<form role=form><div class=form-group><label for=url>Data source URL</label> <input type=url class=form-control id=url ng-model=config.url placeholder=\"Enter data source url\"> <label for=code>Code</label> <textarea class=form-control id=code ng-model=config.code placeholder=\"Enter D3 code here\"></textarea></div></form>");
$templateCache.put("{widgetsPath}/chart/src/edit.html","<form role=form><div class=form-group><label for=url>Data source URL</label> <input type=url class=form-control id=url ng-model=config.url placeholder=\"Enter data source url\"> <label for=type>Type</label> <input type=text class=form-control id=type ng-model=config.type placeholder=\"spline, line, bar, pie, ...\"> <label for=height>Height</label> <input type=text class=form-control id=height ng-model=config.height placeholder=\"Enter height (e.g. 320)\"> <label for=showLegend>showLegend</label> <input type=checkbox class=form-control ng-model=config.showLegend name=showLegend value=showLegend> <label for=showTooltip>showTooltip</label> <input type=checkbox class=form-control ng-model=config.showTooltip name=showTooltip value=showTooltip> <label for=timeseries>Time series</label> <input type=checkbox class=form-control ng-model=config.timeseries name=timeseries value=timeseries> <label for=rotated>Rotated by 90 degrees</label> <input type=checkbox class=form-control ng-model=config.rotated name=rotated value=rotated> <label for=trendtolerance>Tolerance (For trend line only)</label> <input type=text class=form-control ng-model=config.trendtolerance name=trendtolerance value=trendtolerance> <label for=trendinverse>Inverse (For trend line only)</label> <input type=checkbox class=form-control ng-model=config.trendinverse name=trendinverse value=trendinverse></div></form>");
$templateCache.put("{widgetsPath}/chart/src/view-custom.html","<div class=news><div class=\"alert alert-info\" ng-if=!config>Please insert a valid JSON URI in the widget configuration.</div><div ng-if=config><div id=chartd3-{{$id}}></div></div></div>");
$templateCache.put("{widgetsPath}/chart/src/view.html","<div class=news><div class=\"alert alert-info\" ng-if=!config>Please insert a valid JSON URI in the widget configuration.</div><div ng-if=config><c3-chart id=chart-{{$id}} config=config></c3-chart></div></div>");}]);})(window);