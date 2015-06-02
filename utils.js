"use strict";

function sort_and_uniq(a) {
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

module.exports = {
    sort_and_uniq: sort_and_uniq,
    startsWith: startsWith,
    endsWith: endsWith,
    without: without
};
