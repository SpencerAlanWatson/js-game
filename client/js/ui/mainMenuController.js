;
define(['vendor/bootstrap','state', 'manager'], function (bootstrap, state, manager, undefined) {
    'use strict';

    function mainMenuDirective($scope, $window, $document) {
        $scope.menuState = 'start';
        $document.find('#mainMenuModal').modal('show');

    };
    mainMenuDirective.$inject = ['$scope', '$window', '$document'];
    return mainMenuDirective;
});