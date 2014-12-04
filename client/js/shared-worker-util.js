/*global define*/

define(['vendor/lodash', 'vendor/EventDispatcher'], function (lodash, EventDispatcher) {
    'use strict';
    var workerProxyOpts = {

    };

    function SharedWorker(worker) {

        var sharedWorker = lodash.create(null),
            ports = [];
        

        sharedWorker.incomming = lodash.create(null);
        sharedWorker.outgoing = lodash.create(null);
        EventDispatcher.apply(sharedWorker.incomming);
        EventDispatcher.apply(sharedWorker.outgoing);


        worker.addEventListener("connect", function (e) {
            var port = e.ports[0];
            ports.push(port);

            port.addEventListener("message", function (e) {
                sharedWorker.incomming.dispatchEvent({
                    type: e.data.type,
                    data: e.data.data
                });
            }, false);
            
            port.start();
        });
        return new Proxy(sharedWorker, {
            'apply': function (target, thisValue, args) {
                console.log(target, thisValue, args);
            }
        });
    }

    return SharedWorker;
});