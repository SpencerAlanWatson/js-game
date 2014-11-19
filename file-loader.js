;
(function (global, undefined) {
    'use strict';

    function FileLoader() {
        var loader = {
            dirs: {
                'js': 'js/'
            }
        };

        loader.sendRequest = function (filePath, callback) {
            //We do not support IE6 or below, so no need for ActiveXObject
            var req = new XMLHttpRequest();
            try {
                req.addEventListener('readystatechange', function (event) {
                    if (req.readyState === 4) {
                        if (req.status === 200) {
                            callback(null, req.responseText);
                        } else {
                            callback(req, req.responseText);
                        }
                    }
                });
                req.open("GET", filePath, true);
                req.send();
            } catch (err) {
                callback(err, req);
            }

        };


        loader.load = function (type, name, callback) {
            var dir = loader.dirs[type] ? loader.dirs[type] + name : name;

            loader.sendRequest(dir, callback);
        };

        return loader;
    };

    global.Game = global.Game || {};
    global.Game.FileLoader = FileLoader;
}(this));