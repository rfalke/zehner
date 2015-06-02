"use strict";

var requests = require('request');
var q = require('q');
var sprintf = require("sprintf-js").sprintf;
var EventEmitter = require("events").EventEmitter;
var file_support = require("./file_support");
var extraction = require("./extraction");
var startsWith = require("./utils").startsWith;
var verbose = false;

function downloadOneUrl(outputDir, url, logPrefix) {
    var ee = new EventEmitter();

    function reportError(error) {
        console.log(logPrefix + "Got an error while downloading " + url + ": " + error);
    }

    function reportBadStatusTemp(statusCode) {
        console.log(logPrefix + "Got the status code " + statusCode + " instead of the expected 200 while downloading " + url + " (will retry)");
    }

    function reportBadStatusFatal(statusCode) {
        console.log(logPrefix + "Got the status code " + statusCode + " instead of the expected 200 while downloading " + url + " (will not retry)");
    }

    function reportBadDns() {
        console.log(logPrefix + "Failed to download " + url + " because the host name is unknown.");
    }

    requests(url, function (error, response, body) {
        if (error) {
            reportError(error);
            ee.emit("tempFailed");
        } else if (response.statusCode === 403 || response.statusCode === 404) {
            reportBadStatusFatal(response.statusCode);
            ee.emit("failed");
        } else if (response.statusCode !== 200) {
            reportBadStatusTemp(response.statusCode);
            ee.emit("tempFailed");
        } else if (startsWith(response.request.href, "http://navigationshilfe1.t-online.de/dnserror?")) {
            reportBadDns();
            ee.emit("failed");
        } else {
            var fname = file_support.write_response_to_file(outputDir, body, url);
            console.log("     wrote " + fname);
            var links = extraction.extract_links(url, body);
            if (verbose) {
                console.log("Got the following links:");
                console.log(links);
            }
            ee.emit("success", links);
        }
    });
    return ee;
}

function downloadOneUrlWithRetryRec(outputDir, url, retry, numRetries, defer) {
    var ee = downloadOneUrl(outputDir, url, sprintf("    *** retry %d/%d: ", retry + 1, numRetries));
    ee.on("success", function (urls) {
        defer.resolve(urls);
    }).on("failed", function () {
        defer.reject();
    }).on("tempFailed", function () {
        if (retry === numRetries - 1) {
            defer.reject();
        } else {
            downloadOneUrlWithRetryRec(outputDir, url, retry + 1, numRetries, defer);
        }
    });
    return defer.promise;
}

function downloadOneUrlWithRetry(outputDir, url, numRetries) {
    console.assert(numRetries > 0);
    return downloadOneUrlWithRetryRec(outputDir, url, 0, numRetries, q.defer());
}

module.exports = {
    downloadOneUrlWithRetry: downloadOneUrlWithRetry
};
