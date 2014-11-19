;
(function (global, undefined) {
    'use strict';

    function FileLoader() {
        var loader = {
            dirs: {
                'js': 'js/',
                'shader': 'shaders/',
                'css': 'css/',
                'img': 'imgs/',
                'font': 'fonts/'
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


        loader.load = function (type, names, callback) {
            var dirs = names,
                basePath = loader.dirs[type];

            if (typeof names === 'string') {
                dirs = basePath ? [basePath + names] : [names];
                names = [names];
            } else if (Array.isArray(names)) {
                if (basePath) {
                    dirs = _.map(names, function (name, index) {
                        return basePath + name;
                    });
                }
            }

            var filesToLoad = dirs.length,
                filesLoaded = 0,
                errCount = 0,
                files = {};
            
            _.each(dirs, function (dir, index) {
                let name = names[index];
                loader.sendRequest(dir, function (err, data) {
                    ++filesLoaded;
                    if (err) 
                        ++errCount;
                    files[name] = {
                        err: err,
                        data: data
                    };

                    if (filesLoaded >= filesToLoad)
                        callback(errCount, files);
                }); //onFileLoadFactory(names[index], callback));
            });
        };

        return loader;
    };

    global.Game = global.Game || {};
    global.Game.FileLoader = FileLoader;
}(this));