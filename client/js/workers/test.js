var self = this;
importScripts('../vendor/require.js');

define(['shared-worker-util'], function (SharedWorkerUtil) {
    'use strict';
    var sharedWorkerUtil = SharedWorkerUtil(self);
    sharedWorkerUtil.outgoing.addEventListener('thing', function(event) { console.info(event) });
    
});
