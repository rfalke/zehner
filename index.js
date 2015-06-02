"use strict";

var requests = require('request');
var q = require('q');
var sprintf = require("sprintf-js").sprintf;
var EventEmitter = require("events").EventEmitter;
var file_support = require("./file_support");
var extraction = require("./extraction");
var outputDir = process.argv[2];
var startUrl = process.argv[3];

console.log(process.argv);

function startsWith(str, suffix) {
    return str.indexOf(suffix) === 0;
}

function downloadOneUrl(outputDir, url, logPrefix) {
    var ee = new EventEmitter();

    function reportError(error) {
        console.log(logPrefix + "Got an error while downloading " + url + ": " + error);
    }

    function reportBadStatus(statusCode) {
        console.log(logPrefix + "Got the status code " + statusCode + " instead of the expected 200 while downloading " + url);
    }

    function reportBadDns() {
        console.log(logPrefix + "Failed to download " + url + " because the host name is unknown.");
    }

    requests(url, function (error, response, body) {
        if (error) {
            reportError(error);
            ee.emit("tempFailed");
        } else if (response.statusCode !== 200) {
            reportBadStatus(response.statusCode);
            ee.emit("tempFailed");
        } else if (startsWith(response.request.href, "http://navigationshilfe1.t-online.de/dnserror?")) {
            reportBadDns();
            ee.emit("failed");
        } else {
            var fname = file_support.write_response_to_file(outputDir, body, url);
            console.log("Wrote " + fname);
            var links = extraction.extract_links(url, body);
            console.log("Got the following links:");
            console.log(links);
            ee.emit("success", links);
        }
    });
    return ee;
}

function downloadOneUrlWithRetry(outputDir, url, retry, numRetries, defer) {
    if (defer === undefined) {
        defer = q.defer();
    }
    var ee = downloadOneUrl(outputDir, url, sprintf("%2d/%2d: ", retry + 1, numRetries));
    ee.on("success", function (urls) {
        defer.resolve(urls);
    }).on("failed", function () {
        defer.reject();
    }).on("tempFailed", function () {
        if (retry === numRetries - 1) {
            defer.reject();
        } else {
            downloadOneUrlWithRetry(outputDir, url, retry + 1, numRetries, defer);
        }
    });
    return defer.promise;
}

var promise = downloadOneUrlWithRetry(outputDir, startUrl, 0, 3);
promise.then(function (urls) {
        console.log("got " + urls.length + " url(s).");
    },
    function () {
        console.log("");
    });
