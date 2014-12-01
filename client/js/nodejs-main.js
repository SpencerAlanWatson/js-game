;
(function (global, undefined) {
    'use strict';
    var requirejs = require('requirejs');

    requirejs.config({
        baseUrl: __dirname,
        paths: {
            "vendor": "vendor",
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
        nodeRequire: require,
        waitSeconds: 15
    });
    requirejs(["vendor/lodash", "state", "manager", "player", "controls"], StartUp);
    function StartUp(lodash, state, manager, Player, Controls) {
        state.isNodejs = true;
        manager.init(0, 0);
    };
}(global));