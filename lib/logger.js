'use strict';

var sprintf = require('sprintf-js').sprintf;

function now() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

function parallelPrefix() {
    return now() + ': ';
}

function logStartSeq() {
    process.stdout.write('  ' + sprintf.apply(null, arguments));
}
function logFinishedSeq() {
    process.stdout.write('  ' + sprintf.apply(null, arguments) + '\n');
}
function logOtherSeq() {
    process.stdout.write(sprintf.apply(null, arguments) + '\n');
}

function logStartPar() {
    process.stdout.write(parallelPrefix() + sprintf.apply(null, arguments) + '\n');
}
function logFinishedPar() {
    process.stdout.write(parallelPrefix() + '  ' + sprintf.apply(null, arguments) + '\n');
}
function logOtherPar() {
    process.stdout.write(parallelPrefix() + sprintf.apply(null, arguments) + '\n');
}

function toDevNull() {
}

module.exports = {
    seqLogger: {
        logStart: logStartSeq,
        logFinished: logFinishedSeq,
        logOther: logOtherSeq
    },
    parallelLogger: {
        logStart: logStartPar,
        logFinished: logFinishedPar,
        logOther: logOtherPar
    },
    nullLogger: {
        logStart: toDevNull,
        logFinished: toDevNull,
        logOther: toDevNull
    }
};
