"use strict";

var sprintf = require("sprintf-js").sprintf;

function now() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

function parallel_prefix() {
    return now() + ": ";
}

function log_start_seq() {
    process.stdout.write("  " + sprintf.apply(null, arguments));
}
function log_finished_seq() {
    process.stdout.write("  " + sprintf.apply(null, arguments) + "\n");
}
function log_other_seq() {
    process.stdout.write(sprintf.apply(null, arguments) + "\n");
}

function log_start_par() {
    process.stdout.write(parallel_prefix() + sprintf.apply(null, arguments) + "\n");
}
function log_finished_par() {
    process.stdout.write(parallel_prefix() + "  " + sprintf.apply(null, arguments) + "\n");
}
function log_other_par() {
    process.stdout.write(parallel_prefix() + sprintf.apply(null, arguments) + "\n");
}

function to_dev_null() {
}

module.exports = {
    seq_logger: {
        log_start: log_start_seq,
        log_finished: log_finished_seq,
        log_other: log_other_seq
    },
    parallel_logger: {
        log_start: log_start_par,
        log_finished: log_finished_par,
        log_other: log_other_par
    },
    null_logger: {
        log_start: to_dev_null,
        log_finished: to_dev_null,
        log_other: to_dev_null
    }
};
