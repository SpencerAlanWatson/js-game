;
(function (global, undefined) {
    'use strict';

    if (!global.isNodejs) return;
    let Game = {
            Manager: require('./manager'),
            Physics: require('./physics'),
            Player: require('./player'),
            Controls: require('./controls')

        },
        manager = Game.Manager(Game, 0, 0).init();


    console.log(Game);

    module.exports = Game;
}(isNodejs ? global : window));