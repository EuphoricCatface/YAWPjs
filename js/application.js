'use strict';

document.addEventListener("DOMContentLoaded", function() {
    var actuator = new HTMLActuator();
    var manager = new GameManager(5, actuator);
});
