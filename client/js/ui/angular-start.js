;
define(['vendor/angular',
        'ui/angular-config',
        'ui/controlsController',
       'ui/mainMenuDirective'],
    function (angular, config, controlsController, mainMenuDirective, undefined) {
        'use strict';

        var gameApp = angular.module('game', []);
        //gameApp.config(config);
        //gameApp.factory('ideasDataSvc', ideasDataSvc);
        gameApp.controller('controllers', controlsController);
        gameApp.controller('mainMenu', mainMenuDirective);
        //gameApp.controller('ideaDetailsController', ideaDetailsController);

        return {
            gameApp: gameApp,
            bootstrap: function () {
                angular.bootstrap(document.getElementById('angular-bootstrap'), ['game']);
            }
        };
    });