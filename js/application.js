'use strict';
/* global HTMLActuator, GameManager */

document.addEventListener("DOMContentLoaded", function() {
    var actuator = new HTMLActuator();
    var manager = new GameManager(5, actuator);
});
