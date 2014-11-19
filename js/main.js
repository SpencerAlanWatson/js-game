 ;
 (function (global) {
     'use strict';
     //$(document).ready(
     document.addEventListener('readystatechange', function (event) {
         var Game = global.Game,
             manager = Game.Manager(window.innerWidth, window.innerHeight);

         global.Game.manager = manager;


         for (let i = 0, incX = 40; i < 2; ++i) {
             //let p = Game.Player(i, 20 + incX * i, 20);

             //manager.add(p, 'player');

/*             if (i > 0) {
                 let ai = Game.TestAI(i);
                 ai.setupListeners(manager.eventEmitters);
             }*/
         }



         /*manager.add(p1, 'player');
         manager.add(p2, 'player');
         manager.add(p3, 'player');
         manager.add(p4, 'player');
         manager.add(p5, 'player');
         manager.add(p6, 'player');
         manager.add(p7, 'player');*/




         //manager.start();


         //global.Game.p1 = p1;
         //global.Game.p2 = p2;


         var gameApp = angular.module('game', []);
         gameApp.controller('controllers', ['$scope', '$window', '$document',
             function ($scope, $window, $document) {
                 var controls = $window.Game.manager.controls;
                 $scope.players = [0, 1];
                 $scope.gamepads = controls.gamepadsConnected;
                 $scope.gamepadsId = controls.gamepadsId;
                 $scope.bindings = controls.controllerToPlayer;

                 $scope.toggleBinding = function (gamepadIndex, playerId) {
                     if ($scope.bindings[gamepadIndex][playerId]) {
                         controls.addPlayerToController(playerId, gamepadIndex);

                     } else {
                         controls.removePlayerFromController(playerId, gamepadIndex);
                     }
                 };
                 $scope.showStats = false;
                 var testBinded1 = false,
                     testBinded2 = false;

                 $scope.controllerBinder = function (gamepadIndex, playerId) {
                     return function (newValue) {
                         if (angular.isDefined(newValue)) {
                             let index = $parent.bindings[gamepadIndex].indexOf(playerId);
                             if (newValue && index === -1) {
                                 $parent.bindings[gamepadIndex].push(playerId);
                             } else if (!newValue && index !== -1) {
                                 delete $parent.bindings[gamepadIndex][index];
                                 $parent.bindings[gamepadIndex].splice(index, 1);
                             }
                         }
                         return $parent.bindings[gamepadIndex].indexOf(playerId) !== -1;
                     };
                 };

                 $scope.controllerBinded1 = function (newValue) {
                     if (angular.isDefined(newValue)) {
                         console.log(this);
                         return (testBinded1 = newValue);
                     }
                     return testBinded1;
                 }
                 $scope.controllerBinded2 = function (newValue) {
                     return angular.isDefined(newValue) ? (testBinded2 = newValue) : testBinded2;
                 }
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
                 }
                 $scope.alertConnect = '<div class="alert alert-info alert-dismissible fade in" role="alert">';
                 $scope.alertConnect += '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>';
                 $scope.alertConnect += '<h4 class="alert-heading">Controller Connected!</h4>';
                 /*$scope.alertConnect += '<p>Change this and that and try again. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras mattis consectetur purus sit amet fermentum.</p>';
                 $scope.alertConnect += '<p>';
                 $scope.alertConnect += '<button type="button" class="btn btn-danger">Take this action</button>';
                 $scope.alertConnect += '<button type="button" class="btn btn-default">Or do this</button>';
                 $scope.alertConnect += '</p>';*/
                 $scope.alertConnect += '</div>';
                 $scope.onControllerConnect = function (event) {
                     var alert = $($scope.alertConnect).alert().appendTo("#alert-container");
                     $window.setTimeout(function () {
                         alert.alert('close')
                     }, 1000);
                 };
                 controls.addEventListener('control-tick-c-1', $scope.controlTick);
                 controls.addEventListener('control-connected', $scope.onControllerConnect);

         }]);

         angular.bootstrap(document.body, ['game']);

     });
 }(this));
