"use strict";

var sprintf = require("sprintf-js").sprintf;
var download = require("./lib/download");
var utils = require("./lib/utils");
var loggermod = require("./lib/logger");

var defaultConnections = 5;
var numRetries = 5;

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
    version: 'zehner 0.1.0',
    addHelp: true,
    description: 'Zehner: A web crawler written in node.js.'
});
parser.addArgument(
    [ '-o'],
    {
        help: 'set the output directory [defaults to "."]',
        defaultValue: ".",
        metavar: "DIR"
    }
);
parser.addArgument(
    [ '-p' ],
    {
        help: 'download with CONNECTIONS in parallel [defaults to ' + defaultConnections + ']',
        defaultValue: defaultConnections,
        metaVar: "CONNECTIONS",
        type: "int"
    }
);
parser.addArgument(
    [ 'URL' ],
    {
        help: 'the start url'
    }
);
var args = parser.parseArgs();

var outputDir = args.o;
var startUrl = args.URL;
var numParallelDownload = args.p;

function download_one_batch_seq(outputDir, urlsTodo, callback) {
    var newUrls = [];

    function helper(index) {
        if (index >= urlsTodo.length) {
            callback(utils.sort_and_uniq(newUrls));
        } else {
            var url = urlsTodo[index];
            var promise = download.downloadOneUrlWithRetry(outputDir, url, numRetries, sprintf("%d/%d", index + 1, urlsTodo.length), loggermod.seq_logger);
            promise.then(function (urls) {
                newUrls = newUrls.concat(urls);
                helper(index + 1);
            }, function () {
                helper(index + 1);
            });
        }
    }

    helper(0);
}

function download_one_batch_parallel(outputDir, urlsTodo, callback) {
    var newUrls = [];
    var ongoing = 0;
    var finished = 0;
    var nextIndex = 0;

    function try_to_start_download() {
        if (finished === urlsTodo.length) {
            callback(utils.sort_and_uniq(newUrls));
        } else if (ongoing < numParallelDownload && nextIndex < urlsTodo.length) {
            var url = urlsTodo[nextIndex];
            nextIndex++;
            ongoing++;
            var promise = download.downloadOneUrlWithRetry(outputDir, url, numRetries, sprintf("%d/%d", nextIndex, urlsTodo.length), loggermod.parallel_logger);
            promise.then(function (urls) {
                newUrls = newUrls.concat(urls);
                ongoing--;
                finished++;
                try_to_start_download();
            }, function () {
                ongoing--;
                finished++;
                try_to_start_download();
            });
            try_to_start_download();
        }
    }

    try_to_start_download();
}

function driver(outputDir, urlsTodo, urlsSoFar, completedBatches, download_one_batch) {
    console.log(sprintf("driver: start batch %d with %d urls (%d urls already done)", completedBatches + 1, urlsTodo.length, urlsSoFar.length));
    download_one_batch(outputDir, urlsTodo, function (allNewUrls) {
        console.log("=== finished the batch with " + allNewUrls.length + " new url(s)");
        urlsSoFar = utils.sort_and_uniq(urlsSoFar.concat(urlsTodo));
        var reallyNewUrls = utils.without(allNewUrls, urlsSoFar);
        if (reallyNewUrls.length > 0) {
            driver(outputDir, reallyNewUrls, urlsSoFar, completedBatches + 1, download_one_batch);
        }
    });
}

if (numParallelDownload === 1) {
    driver(outputDir, [startUrl], [], 0, download_one_batch_seq);
} else {
    driver(outputDir, [startUrl], [], 0, download_one_batch_parallel);
}
