'use strict';
// // Wait till the browser is ready to render the game (avoids glitches)
// window.requestAnimationFrame(function() {
document.addEventListener("DOMContentLoaded", function () {
    var actuator = new HTMLActuator();
    var manager = new GameManager(5, actuator);
});
//# sourceMappingURL=application.js.map