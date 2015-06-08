'use strict';

var sprintf = require('sprintf-js').sprintf;

function sortAndUniq(a) {
    return a.sort().filter(function (item, pos, ary) {
        return !pos || item !== ary[pos - 1];
    });
}

function startsWith(str, suffix) {
    return str.indexOf(suffix) === 0;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function without(arr1, arr2) {
    var result = [];
    arr1.forEach(function (item) {
        if (arr2.indexOf(item) < 0) {
            result.push(item);
        }
    });
    return result;
}

function reverse(s) {
    return s.split('').reverse().join('');
}

function formatBytes(n) {
    var sep = ',';
    var tmp = reverse('' + n);
    var result = '';
    while (tmp.length > 3) {
        result += tmp.substr(0, 3) + sep;
        tmp = tmp.substr(3);
    }
    result += tmp;
    return reverse(result);
}

function formatRate(bytes, timeInSec) {
    if (timeInSec < 0.1) {
        return '--.- K/s';
    }
    return sprintf('%.1f K/s', (bytes / timeInSec) / 1024.0);
}

module.exports = {
    sortAndUniq: sortAndUniq,
    startsWith: startsWith,
    endsWith: endsWith,
    without: without,
    formatBytes: formatBytes,
    formatRate: formatRate
};
