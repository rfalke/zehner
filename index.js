"use strict";

var sprintf = require("sprintf-js").sprintf;
var download = require("./download");
var utils = require("./utils");

var outputDir = process.argv[2];
var startUrl = process.argv[3];
var numRetries = 3;

console.log(process.argv);

function download_one_batch_seq(outputDir, urlsTodo, callback) {
    var newUrls = [];

    function helper(index) {
        if (index >= urlsTodo.length) {
            callback(utils.sort_and_uniq(newUrls));
        } else {
            var url = urlsTodo[index];
            console.log(sprintf("%4d/%4d: start downloading %s", index + 1, urlsTodo.length, url));
            var promise = download.downloadOneUrlWithRetry(outputDir, url, numRetries);
            promise.then(function (urls) {
                newUrls = newUrls.concat(urls);
                console.log(sprintf("%4d/%4d: finished downloading %s", index + 1, urlsTodo.length, url));
                helper(index + 1);
            }, function () {
                helper(index + 1);
            });
        }
    }

    helper(0);
}

function driver(outputDir, urlsTodo, urlsSoFar) {
    console.log("=== starting a batch with " + urlsTodo.length + " url(s)");
    download_one_batch_seq(outputDir, urlsTodo, function (allNewUrls) {
        console.log("=== finished the batch with " + allNewUrls.length + " new url(s)");
        urlsSoFar = utils.sort_and_uniq(urlsSoFar.concat(urlsTodo));
        var reallyNewUrls = utils.without(allNewUrls, urlsSoFar);
        driver(outputDir, reallyNewUrls, urlsSoFar);
    });
}

driver(outputDir, [startUrl], []);
