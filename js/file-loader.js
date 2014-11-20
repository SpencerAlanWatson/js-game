;
(function (global, undefined) {
    'use strict';

    function FileLoader() {
        var loader = {
            dirs: {
                'js': 'js/',
                'json': 'json/',
                'shader': 'shaders/',
                'css': 'css/',
                'img': 'imgs/',
                'font': 'fonts/'
            }
        };

        loader.sendRequest = function (filePath, callback) {
            //We do not support IE6 or below, so no need for ActiveXObject
            var req = new XMLHttpRequest();

            req.addEventListener('readystatechange', function (event) {
                console.log(req);
                if (req.readyState === 4) {
                    if (req.status === 200)
                        callback(null, req.responseText);
                    else
                        callback(req, req.responseText);
                }
            });
            req.open("GET", filePath, true);
            req.send();
        };
        loader.sendRequestSync = function (filePath) {
            //We do not support IE6 or below, so no need for ActiveXObject
            var req = new XMLHttpRequest();
            req.open("GET", filePath, false);
            req.send();
            return req.responseText;
        };

        loader.getFilePaths = function (type, names) {
            var basePath = loader.dirs[type];
            if (basePath) {
                return _.map(names, function (name, index) {
                    return basePath + name;
                });
            } else {
                return [].concat(names);
            }
        };

        function loadFileFactory(filesToLoad, callback) {
            var filesLoaded = 0,
                errCount = 0,
                files = {};

            return function (err, data, name) {

                ++filesLoaded;

                if (err)
                ++errCount;

                files[name] = {
                    err: err,
                    data: data
                };

                if (filesLoaded === filesToLoad) {
                    callback(errCount, files);
                }

            }
        }
        loader.load = function (type, fileNames, callback) {

            //If it is a string, this will make it an array,
            //if it is an array, it will change nothing.
            var names = [].concat(fileNames),
                dirs = loader.getFilePaths(type, names),
                onFileLoad = loadFileFactory(dirs.length, callback);

            _.each(dirs, function (dir, index) {
                loader.sendRequest(dir, _.partialRight(onFileLoad, names[index]));
            });
        };

        loader.loadSync = function (type, fileNames) {

            //If it is a string, this will make it an array,
            //if it is an array, it will change nothing.
            var names = [].concat(fileNames),
                dirs = loader.getFilePaths(type, names),
                files = {};
            
            _.each(dirs, function (dir, index) {
                files[names[index]] = loader.sendRequestSync(dir);
                //loader.sendRequest(dir, _.partialRight(onFileLoad, names[index]));
            });
            return files;
        };

        return loader;
    };

    global.Game = global.Game || {};
    global.Game.FileLoader = FileLoader();
}(this));