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
                if (req.readyState === 4) {
                    if (req.status === 200)
                        callback(null, req);
                    else
                        callback(req.status, req);
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
            return req;
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
                results = {
                    files: {}
                };
            return function (err, data, name) {

                ++filesLoaded;

                if (err) {
                    ++errCount;
                    if (!results.errors) results.errors = {};
                    results.errors[name] = data;
                } else {
                    results.files[name] = data.responseText;
                }


                if (filesLoaded === filesToLoad) {
                    callback(errCount, results);
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
                results = {
                    files: {}
                };

            _.each(dirs, function (dir, index) {
                var req = loader.sendRequestSync(dir),
                    name = names[index];
                if (req.status !== 200) {
                    if(!results.errors) results.errors = {};
                    results.errors[name] = req;
                } else {
                    results.files[name] = req.response;
                }
                //loader.sendRequest(dir, _.partialRight(onFileLoad, names[index]));
            });
            return results;
        };

        return loader;
    };

    global.Game = global.Game || {};
    global.Game.FileLoader = FileLoader();
}(this));