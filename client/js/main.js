 ;
 (function (global, undefined) {
     'use strict';
     //$(document).ready(
     var scriptType = "";
     if (navigator.userAgent.indexOf('Firefox') !== -1)
         scriptType = "text/javascript;version=1.8"; //"application/javascript;version=1.7";

     require.config({
         baseUrl: "js",
         paths: {
             "vendor": "vendor",
             "ui": "ui"
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
     require([ "state", "manager", "player", "controls", "ui/angular-start"], StartUp)

     function StartUp(state, Manager, Player, Controls, angularStart) {
         state.isNodejs = global.isNodejs;
         /*var Game = global.Game,
             manager = Manager.init(window.innerWidth, window.innerHeight);



         for (let i = 0, incX = 40; i < state.playerTotal; ++i) {
             let p = Player(i, 20 + incX * i, 20);
             manager.add(p);
         }
         manager.start();*/
         //global.Game.p1 = p1;
         //global.Game.p2 = p2;
         angularStart.bootstrap();
     };
 }(isNodejs ? global : window));