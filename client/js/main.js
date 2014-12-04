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
     require(["vendor/bootstrap", "vendor/angular", "serv/state", "mod/manager", "fact/player", "mod/controls"], StartUp)

     function StartUp(bootstrap, angular,  state, Manager, Player, Controls) {
         state.isNodejs = global.isNodejs;
         var Game = global.Game,
             manager = Manager.init(window.innerWidth, window.innerHeight);



         for (var i = 0, incX = 40; i < state.playerTotal; ++i) {
             var p = Player(i, 20 + incX * i, 20);
             manager.add(p);
         }
         manager.start();
         //global.Game.p1 = p1;
         //global.Game.p2 = p2;
         var gameApp = angular.module('game', []);
         gameApp.controller('controllers', ['$scope', '$window', '$document',
             function ($scope, $window, $document) {
                 var controls = manager.controls;
                 $scope.players = [0, 1];
                 $scope.gamepads = controls.gamepadsConnected;
                 $scope.gamepadsId = controls.gamepadsId;
                 $scope.controllerToPlayer = controls.controllerToPlayer;
                 $scope.inputNames = controls.inputNames;
                 $scope.controllerBindings = controls.controllerBindings;
                 $scope.currentStates = {
                     '-1': {}
                 };


                 $scope.toggleControllerToPlayer = function (gamepadIndex, playerId) {
                     if ($scope.controllerToPlayer[gamepadIndex][playerId]) {
                         controls.addPlayerToController(playerId, gamepadIndex);

                     } else {
                         controls.removePlayerFromController(playerId, gamepadIndex);
                     }
                 };
                 $scope.showStats = false;

                 $scope.controlTick = function (event) {
                     var input = event.input;
                     if (input['showStats'].released) {
                         $scope.showStats = !$scope.showStats;
                         $scope.$apply();
                     }
                     if (input['showControls'].released) {
                         $document.find('#myModal').modal('toggle');
                     }
                     $scope.$apply();
                 };
                 $scope.controlTickAll = function (event) {
                     var gamepads = event.gamepads,
                         keysPressed = event.keysPressed,
                         keysReleased = event.keysReleased,
                         currentStates = {
                             '-1': {}
                         };

                     for (var keyCode of keysPressed) {
                         currentStates[-1][keyCode] = {
                             name: keyCode,
                             value: 1,
                             pressed: true,
                             released: false
                         };
                     }
                     for (var keyCode of keysReleased) {
                         if (currentStates[-1][keyCode]) {
                             currentStates[-1][keyCode].value = 0;
                             currentStates[-1][keyCode].released = true;
                         } else {
                             currentStates[-1][keyCode] = {
                                 name: keyCode,
                                 value: 0,
                                 pressed: false,
                                 released: true
                             };
                         }
                     }
                     var i = 0,
                         gamepad = gamepads[i];
                     while (gamepad) {
                         currentStates[gamepad.index] = {};
                         for (var buttonIndex in gamepad.buttons) {
                             var button = gamepad.buttons[buttonIndex];
                             currentStates[gamepad.index][buttonIndex] = {
                                 name: buttonIndex,
                                 value: button.value,
                                 pressed: button.pressed,
                                 released: 'N/A'
                             };
                         }
                         for (var axesIndex in gamepad.axes) {
                             var axesValue = gamepad.axes[axesIndex],
                                 axesName = 'a' + axesIndex;
                             currentStates[gamepad.index][axesName] = {
                                 name: axesName,

                                 value: axesValue,
                                 pressed: axesValue !== 0,
                                 released: 'N/A'
                             };
                         }
                         gamepad = gamepads[++i];
                     }

                     $scope.currentStates = currentStates;

                     //$scope.$apply();



                 };
                 $scope.alertConnect = '<div class="alert alert-info alert-dismissible fade in" role="alert">';
                 $scope.alertConnect += '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>';
                 $scope.alertConnect += '<h4 class="alert-heading">Controller Connected!</h4>';
                 $scope.alertConnect += '</div>';
                 $scope.onControllerConnect = function (event) {
                     var alert = $($scope.alertConnect).alert().appendTo("#alert-container");
                     $window.setTimeout(function () {
                         alert.alert('close')
                     }, 1000);
                 };
                 controls.addEventListener('control-tick-c-1', $scope.controlTick);
                 controls.addEventListener('control-tick-all', $scope.controlTickAll);

                 controls.addEventListener('control-connected', $scope.onControllerConnect);

         }]);
         var angularDom = document.getElementById('angular-bootstrap');

         try {
             angular.bootstrap(angularDom, ['game']);
         } catch (e) {
             console.error(e);
         }
     };
 }(isNodejs ? global : window));