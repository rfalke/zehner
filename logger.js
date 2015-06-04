"use strict";

var sprintf = require("sprintf-js").sprintf;

function log_start() {
    process.stdout.write("  " + sprintf.apply(null, arguments));
}
function log_finished() {
    process.stdout.write("  " + sprintf.apply(null, arguments) + "\n");
}
function log_other() {
    process.stdout.write(sprintf.apply(null, arguments) + "\n");
}

module.exports = {
    log_start: log_start,
    log_finished: log_finished,
    log_other: log_other
};
