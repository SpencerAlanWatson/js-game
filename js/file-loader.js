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

        loader.sendRequest = function (filePath) {
            return new Promise(function (resolve, reject) {
                //We do not support IE6 or below, so no need for ActiveXObject
                var req = new XMLHttpRequest();
                req.addEventListener('readystatechange', function (event) {
                    if (req.readyState === 4) {
                        if (req.status === 200)
                            resolve(req); //callback(null, req);
                        else
                            reject(req);
                    }
                });
                req.open("GET", filePath, true);
                req.send();
            });

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

        function loadFileFactory(filesToLoad, resolve, reject) {
            var results = {
                files: _.create(null),
                errCount: 0,
                filesLoaded: 0
            };


            return [

                function (data, name) {

                    ++results.filesLoaded;
                    results.files[name] = data.responseText;


                    if (results.filesLoaded === filesToLoad) {
                        resolve(results);
                    }

            },
                function (error, name) {
                    ++results.filesLoaded;
                    ++results.errCount;
                    if (!results.errors) results.errors = _.create(null);
                    results.errors[name] = error;


                    if (results.filesLoaded === filesToLoad && results.errCount === filesToLoad) {
                        reject(results);
                    } else if (results.filesLoaded === filesToLoad) {
                        resolve(results);
                    }
            }];
        }
        loader.load = function (type, fileNames, callback) {

            //If it is a string, this will make it an array,
            //if it is an array, it will change nothing.

            return new Promise(function (resolve, reject) {
                var names = [].concat(fileNames),
                    dirs = loader.getFilePaths(type, names),
                    onFileLoad = loadFileFactory(dirs.length, resolve, reject);
                _.each(dirs, function (dir, index) {
                    let name = names[index];
                    loader.sendRequest(dir)
                        .then(_.partialRight(onFileLoad[0], name),
                            _.partialRight(onFileLoad[1], name));
                });
            });

        };

        loader.loadSync = function (type, fileNames) {

            //If it is a string, this will make it an array,
            //if it is an array, it will change nothing.
            var names = [].concat(fileNames),
                dirs = loader.getFilePaths(type, names),
                results = {
                    files: _.create(null),
                    errCount: 0,
                    filesLoaded: 0
                };

            _.each(dirs, function (dir, index) {
                var req = loader.sendRequestSync(dir),
                    name = names[index];
                ++results.filesLoaded;
                if (req.status !== 200) {
                    if (!results.errors) results.errors = _.create(null);
                    ++results.errCount;
                    results.errors[name] = req;
                } else {
                    results.files[name] = req.response;
                }
            });
            return results;
        };

        return loader;
    };

    global.Game = global.Game || {};
    global.Game.FileLoader = FileLoader();
}(this));