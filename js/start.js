;
(function (global, undefined) {
        'use strict';
        //$(document).ready(
        var scriptType = navigator.userAgent.indexOf('Firefox') === -1 ? 'application/javascript' : 'application/javascript;version=1.7',
            dbVersion = 8,
            onDBError;

        function StartGame() {
            var fileLoader = global.Game.FileLoader(),
                scriptContainer = document.getElementById('js-container'),
                openReq = global.indexedDB.open("game-scripts", dbVersion),
                loadedScriptsContainer = createLoadedContainer();
            
            scriptContainer.appendChild(loadedScriptsContainer);
            onDBError = onDBErrorFactory(fileLoader, loadedScriptsContainer);


            openReq.addEventListener('error', onDBError);

            openReq.addEventListener('upgradeneeded', function (event) {
                setupDB(fileLoader, loadedScriptsContainer, openReq.result);
            });

            openReq.addEventListener('success', function (event) {
                loadScriptsFromDB(fileLoader, loadedScriptsContainer, openReq.result);
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
            var FileLoader = global.Game.FileLoader;
            delete global.Game;
            global.Game = {
                FileLoader: FileLoader,
                RestartGame: RestartGame,
                StartGame: StartGame,
                UpdateGame: UpdateGame,
                statusEmitter:
            };
            var loadedContainer = document.getElementById('loaded-js-container');
            emptyDom(loadedContainer);
            document.getElementById('js-container').removeChild(loadedContainer);
            StartGame();
        };

        function UpdateGame() {
            var fileLoader = global.Game.FileLoader(),
                openReq = global.indexedDB.open("game-scripts", dbVersion),

                scriptContainer = document.getElementsById('js-container'),
                loadedContainer = scriptContainer.getElementById('loaded-js-container');
            emptyDom(loadedContainer);
            scriptContainer.removeChild(loadedContainer);

            loadedContainer = createLoadedContainer();
            scriptContainer.appendChild(loadedContainer);

            downloadScripts(
            };
            window.addEventListener('load', StartGame);

            function onDBErrorFactory(fileLoader, container) {
                return function (event) {
                    console.error("Couldn't open indexedDB Scripts database, going to download scripts", event);
                    downloadScripts(fileLoader, container);
                }
            };

            function loadScriptsFromDB(fileLoader, container, db) {
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

            function downloadScripts(fileLoader, container, db) {
                console.error('downloadScripts');
                fileLoader.load('json', 'scripts.json', function (scriptsError, scriptsFiles) {
                    console.log(scriptsError, scriptsFiles);
                    if (scriptsError) throw scriptsFiles['scripts.json'].err;
                    var scriptNames = JSON.parse(scriptsFiles['scripts.json'].data);
                    fileLoader.load('js', scriptNames, function (scriptErrorCount, scriptObjects) {
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
                    });
                });
            }

            function storeScriptsInDB(db, loadTimestamp, scriptObjects) {
                var transaction = db.transaction('game-scripts', 'readwrite'),
                    objectStore = transaction.objectStore("game-scripts");

                _.each(scriptObjects, function (file, name) {
                    var obj = {
                        name: name,
                        data: file.data,
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

                downloadScripts(fileLoader, container, db);
            };

            global.Game = global.Game || {};
            global.Game.StartGame = StartGame;
            global.Game.RestartGame = RestartGame;
            global.Game.UpdateGame = UpdateGame;
            global.Game.statusEmitter = {};

            EventDispatcher.prototype.apply(global.Game.statusEmitter);
        }(this));