"use strict";

var sprintf = require("sprintf-js").sprintf;
var download = require("./lib/download");
var utils = require("./lib/utils");
var loggermod = require("./lib/logger");
var url_support = require("./lib/url_support");

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
        help: 'the start url. Without any --r* flags only this url will be fetched.'
    }
);
parser.addArgument(
    [ '--r1' ],
    {
        help: "limit recursive download to the sub directory of the initial URL",
        nargs: 0,
        action: "storeTrue"
    }
);
parser.addArgument(
    [ '--r2' ],
    {
        help: "limit recursive download to host of the initial URL",
        nargs: 0,
        action: "storeTrue"
    }
);
parser.addArgument(
    [ '--r3' ],
    {
        help: "do not limit the recursive download",
        nargs: 0,
        action: "storeTrue"
    }
);
var args = parser.parseArgs();

var outputDir = args.o;
var startUrl = args.URL;
var numParallelDownload = args.p;
function choose_predicate(args) {
    if (args.r1) {
        return function (seed, url) {
            return url_support.is_in_subdir(seed, url);
        };
    } else if (args.r2) {
        return function (seed, url) {
            return url_support.is_same_host(seed, url);
        };
    } else if (args.r3) {
        return function no_limitation() {
            return true;
        };
    } else {
        return function only_the_start_url() {
            return false;
        };
    }
}
var followNewUrlPredicate = choose_predicate(args);

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
                newUrls = newUrls.concat(urls.filter(function (url) {
                    return followNewUrlPredicate(startUrl, url);
                }));
                ongoing--;
                finished++;
                try_to_start_download();
            }, function () {
                ongoing--;
                finished++;
                try_to_start_download();
            }).done();
            try_to_start_download();
        }
    }

    try_to_start_download();
}

function driver(urlsTodo, urlsSoFar, completedBatches, download_one_batch) {
    console.log(sprintf("driver: start batch %d with %d urls (%d urls already done)", completedBatches + 1, urlsTodo.length, urlsSoFar.length));
    download_one_batch(outputDir, urlsTodo, function (allNewUrls) {
        console.log("=== finished the batch with " + allNewUrls.length + " new url(s)");
        urlsSoFar = utils.sort_and_uniq(urlsSoFar.concat(urlsTodo));
        var reallyNewUrls = utils.without(allNewUrls, urlsSoFar);
        if (reallyNewUrls.length > 0) {
            driver(reallyNewUrls, urlsSoFar, completedBatches + 1, download_one_batch);
        }
    });
}

if (numParallelDownload === 1) {
    driver([startUrl], [], 0, download_one_batch_seq);
} else {
    driver([startUrl], [], 0, download_one_batch_parallel);
}
