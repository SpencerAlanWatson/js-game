 ;
 (function (global, undefined) {
     'use strict';
     //$(document).ready(
     var scriptType = "";
     if (navigator.userAgent.indexOf('Firefox') !== -1)
         scriptType = "application/javascript;version=1.7";

     require.config({
         baseUrl: "js",
         paths: {
             "vendor": "vendor",
             "cntr": "controllers",
             "dir": "directives",
             "mod": "modules",
             "serv": "services",
             "util": "utils",
             "fact": "factories"
         },
         shim: {
             "vendor/angular": {
                 deps: ['jquery'],
                 exports: 'angular'
             },
             'vendor/bootstrap': ['jquery']


         },
         map: {
             // '*' means all modules will get 'jquery-private'
             // for their 'jquery' dependency.
             '*': {
                 'vendor/lodash': 'vendor/lodash-private'
             },

             // 'lodash-private' wants the real lodash module
             // though. If this line was not here, there would
             // be an unresolvable cyclic dependency.
             'vendor/lodash-private': {
                 'vendor/lodash': 'vendor/lodash'
             }
         },
         scriptType: scriptType,

         waitSeconds: 15
     });
     require(["vendor/bootstrap", "serv/state", "mod/manager", "fact/player", "mod/controls"], StartUp)

     function StartUp(bootstrap, angular, state, Manager, Player, Controls) {
         state.isNodejs = global.isNodejs;
         var Game = global.Game,
             manager = Manager.init(window.innerWidth, window.innerHeight);
         
         for (var i = 0, incX = 40; i < state.playerTotal; ++i) {
             var p = Player(i, 20 + incX * i, 20);
             manager.add(p);
         }
     }
 }(isNodejs ? global : window));