 ;
 (function (global) {
     'use strict';
     //$(document).ready(
     document.addEventListener('readystatechange',function (event) {
         var Game = global.Game,
             manager = Game.Manager(500, 500),
             p1 = Game.Player(1, 20, 20),
             p2 = Game.Player(2, 60, 20);


         p1.bindControls(manager.controls);
         p2.bindControls(manager.controls);

         manager.addToAll(p1, 'player');
         manager.addToAll(p2, 'player');

         manager.start();
         global.Game.manager = manager;
         global.Game.p1 = p1;
         global.Game.p2 = p2;
     });
 }(this));