;
(function (global, undefined) {
    'use strict';
    //$(document).ready(
    var scriptType = navigator.userAgent.indexOf('Firefox') === -1 ? 'application/javascript' : 'application/javascript;version=1.7',
        dbVersion = 8,
        onDBError;

    function StartGame() {
        var openReq = global.indexedDB.open("game-scripts", dbVersion),
            scriptContainer = document.getElementById('js-container'),
            loadedScriptsContainer = createLoadedContainer();

        scriptContainer.appendChild(loadedScriptsContainer);
        onDBError = onDBErrorFactory(loadedScriptsContainer);


        openReq.addEventListener('error', onDBError);

        openReq.addEventListener('upgradeneeded', function (event) {
            setupDB(fileLoader, loadedScriptsContainer, openReq.result);
            downloadScripts(loadedScriptsContainer)
                .then(function (container) {

                    //appendScriptsToDom(scriptObjects, loadedScriptsContainer);
                    //storeScriptsInDB(db, new Date(), scriptObjects);
                    sendStartEvent();

                }, function (errors) {
                    throw errors;
                });
        });

        openReq.addEventListener('success', function (event) {
            //loadScriptsFromDB(loadedScriptsContainer, openReq.result);
            downloadScripts(loadedScriptsContainer).then(function (filePaths) {
                /*console.log('success Download', scriptObjects);

                    appendScriptsToDom(scriptObjects, loadedScriptsContainer);
                    sendStartEvent();
                    storeScriptsInDB(db, new Date(), scriptObjects);*/
                sendStartEvent();


            }, function (errors) {
                throw errors;
            });
        });

        //downloadScripts(fileLoader, container, null);

    };

    function createLoadedContainer() {
        var loadedScriptsContainer = document.createElement('section');
        loadedScriptsContainer.id = 'loaded-js-container';
        return loadedScriptsContainer;
    };

    function emptyDom(dom) {
        while (dom.hasChildNodes()) {
            dom.removeChild(dom.lastChild);
        }
    }

    function RestartGame() {
        location.reload();
    };

    function UpdateGame() {
        var openReq = global.indexedDB.open("game-scripts", dbVersion),
            dlScripts = function (db) {
                downloadScripts().then(function (scriptObjects) {
                    console.log('success Download', scriptObjects);
                    storeScriptsInDB(db, new Date(), scriptObjects);
                    RestartGame();
                }, function (errors) {
                    throw errors;
                })
            };
        openReq.addEventListener('upgradeneeded', function (event) {
            setupDB(fileLoader, loadedScriptsContainer, openReq.result);
            dlScripts(openReq.result);
        });
        openReq.addEventListener('success', function () {
            console.log('success Open');
            dlScripts(openReq.result);
        });


    };
    window.addEventListener('load', StartGame);

    function onDBErrorFactory(container) {
        return function (event) {
            console.error("Couldn't open indexedDB Scripts database, going to download scripts", event);
            downloadScripts()
                .then(function (scriptObjects) {
                    appendScriptsToDom(scriptObjects, container);
                    sendStartEvent();

                }, function (errors) {
                    throw errors;
                })
        }
    };

    function loadScriptsFromDB(container, db) {
        //global.db = db;
        //downloadScripts(fileLoader, container, db);
        //downloadScripts(fileLoader, container, db);
        var transaction = db.transaction(['game-scripts'], "readonly");
        var objectStore = transaction.objectStore('game-scripts');
        var elems = {};

        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {

                var elem = document.createElement('script');
                elem.setAttribute('type', scriptType);
                elem.innerHTML = cursor.value.data;
                console.log(cursor.value.name);
                if (!elems[cursor.value.loadOrder]) elems[cursor.value.loadOrder] = [];
                elems[cursor.value.loadOrder].push(elem);
                cursor.continue();
            } else {
                _.each(elems, function (loadOrder, index) {
                    _.each(loadOrder, function (elem, name) {
                        container.appendChild(elem);
                    });;
                });
                sendStartEvent();
                console.log('Entries all displayed.');
            }
        };
    }

    function sendStartEvent() {
        var load_event = document.createEvent("HTMLEvents");
        load_event.initEvent("readystatechange", true, true);
        document.dispatchEvent(load_event);
    };

    function downloadScripts(container) {
        return new Promise(function (resolve, reject) {
            Game.FileLoader.load('json', 'scripts.json').then(function (jsonObjects) {
                console.log(jsonObjects);
                if (jsonObjects.errCount) throw jsonObjects.errors;
                var scriptNames = JSON.parse(jsonObjects.files['scripts.json']);
                if (container) {

                    var filePaths = Game.FileLoader.getFilePaths('js', scriptNames);
                    var toLoad = filePaths.length,
                        doneLoading = 0;

                    function Done(path, event) {
                        ++doneLoading;
                        if (doneLoading >= toLoad) {
                            resolve(container);
                        }
                    };
                    _.each(filePaths, function (path) {
                        console.log(path);

                        var elem = document.createElement('script');
                        elem.setAttribute('type', scriptType);
                        elem.src = path;
                        elem.addEventListener('load', function (event) {
                            Done(path, event);
                        });
                        console.dir(elem);
                        container.appendChild(elem);
                    });

                } else {
                    resolve(Game.FileLoader.load('js', scriptNames));
                }
                /*fileLoader.load('js', scriptNames, function (scriptErrorCount, scriptObjects) {
                            console.log(scriptNames.length);
                            console.count('loadedScripts');
                            //This is so we can keep the order the same
                            console.log(scriptErrorCount, scriptObjects);
                            for (var name of scriptNames) {
                                var scriptObject = scriptObjects[name];
                                if (scriptObject.err) {
                                    console.error(scriptObject.err);
                                } else {
                                    var elem = document.createElement('script');
                                    elem.setAttribute('type', scriptType);
                                    elem.innerHTML = scriptObject.data;
                                    container.appendChild(elem);
                                }
                            }
                            storeScriptsInDB(db, new Date(), scriptObjects);

                            sendStartEvent();
                            //storeScriptsInDB(db, scriptObjects);
                        });*/
            }, reject);
        });
    }

    function appendScriptsToDom(scriptObjects, container) {
        console.groupCollapsed('Scripts Append');
        _.each(scriptObjects.names, function (name, index) {
            var data = scriptObjects.files[name];

            if (data) {
                var elem = document.createElement('script');
                elem.setAttribute('type', scriptType);
                elem.innerHTML = data;
                console.log(name);

                container.appendChild(elem);
            } else {
                console.error(scriptObjects.errors[name]);
            }
        });
        console.groupEnd();
    };

    function storeScriptsInDB(db, loadTimestamp, scriptObjects) {
        var transaction = db.transaction('game-scripts', 'readwrite'),
            objectStore = transaction.objectStore("game-scripts");

        _.each(scriptObjects.files, function (file, name) {
            var obj = {
                name: name,
                data: file,
                lastModified: loadTimestamp,
                loadOrder: 1
            };
            if (name.indexOf('jquery') !== -1) obj.loadOrder = 0;
            var storeRequest = objectStore.add(obj);
            /*storeRequest.addEventListener('success', function(event) {
             
            });*/
        });
    };

    function setupDB(fileLoader, container, db) {
        db.addEventListener('error', onDBError);
        // Create an objectStore for this database   
        db.deleteObjectStore('game-scripts');
        var objectStore = db.createObjectStore("game-scripts", {
            keyPath: "name"
        });

        // define what data items the objectStore will contain

        objectStore.createIndex("data", "data", {
            unique: false
        });
        objectStore.createIndex("lastModified", "lastModified", {
            unique: false
        });
        objectStore.createIndex("loadOrder", "loadOrder", {
            unique: false
        });


    };

    global.Game = global.Game || {};
    global.Game.StartGame = StartGame;
    global.Game.RestartGame = RestartGame;
    global.Game.UpdateGame = UpdateGame;
    global.Game.statusEmitter = {};

    EventDispatcher.prototype.apply(global.Game.statusEmitter);
}(this));