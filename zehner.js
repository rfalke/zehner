#!/usr/bin/env node

'use strict';

var sprintf = require('sprintf-js').sprintf;
var download = require('./lib/download');
var utils = require('./lib/utils');
var loggermod = require('./lib/logger');
var urlsupport = require('./lib/url_support');

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
        defaultValue: '.',
        metavar: 'DIR'
    }
);
parser.addArgument(
    [ '-p' ],
    {
        help: 'download with CONNECTIONS in parallel [defaults to ' + defaultConnections + ']',
        defaultValue: defaultConnections,
        metaVar: 'CONNECTIONS',
        type: 'int'
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
        help: 'limit recursive download to the sub directory of the initial URL',
        nargs: 0,
        action: 'storeTrue'
    }
);
parser.addArgument(
    [ '--r2' ],
    {
        help: 'limit recursive download to host of the initial URL',
        nargs: 0,
        action: 'storeTrue'
    }
);
parser.addArgument(
    [ '--r3' ],
    {
        help: 'do not limit the recursive download',
        nargs: 0,
        action: 'storeTrue'
    }
);
var args = parser.parseArgs();

var outputDir = args.o;
var startUrl = args.URL;
var numParallelDownload = args.p;
function choosePredicate(args) {
    if (args.r1) {
        return function (seed, url) {
            return urlsupport.isInSubdir(seed, url);
        };
    } else if (args.r2) {
        return function (seed, url) {
            return urlsupport.isSameHost(seed, url);
        };
    } else if (args.r3) {
        return function noLimitation() {
            return true;
        };
    } else {
        return function onlyTheStartUrl() {
            return false;
        };
    }
}
var followNewUrlPredicate = choosePredicate(args);

function downloadOneBatchSeq(outputDir, urlsTodo, callback) {
    var newUrls = [];

    function helper(index) {
        if (index >= urlsTodo.length) {
            callback(utils.sortAndUniq(newUrls));
        } else {
            var url = urlsTodo[index];
            var prefix = sprintf('%d/%d', index + 1, urlsTodo.length);
            var promise = download.downloadOneUrlWithRetry(outputDir, url, numRetries, prefix, loggermod.seqLogger);
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

function downloadOneBatchParallel(outputDir, urlsTodo, callback) {
    var newUrls = [];
    var ongoing = 0;
    var finished = 0;
    var nextIndex = 0;

    function tryToStartDownload() {
        if (finished === urlsTodo.length) {
            callback(utils.sortAndUniq(newUrls));
        } else if (ongoing < numParallelDownload && nextIndex < urlsTodo.length) {
            var url = urlsTodo[nextIndex];
            nextIndex++;
            ongoing++;
            var prefix = sprintf('%d/%d', nextIndex, urlsTodo.length);
            var promise = download.downloadOneUrlWithRetry(outputDir, url, numRetries, prefix, loggermod.parallelLogger);
            promise.then(function (urls) {
                newUrls = newUrls.concat(urls.filter(function (url) {
                    return followNewUrlPredicate(startUrl, url);
                }));
                ongoing--;
                finished++;
                tryToStartDownload();
            }, function () {
                ongoing--;
                finished++;
                tryToStartDownload();
            }).done();
            tryToStartDownload();
        }
    }

    tryToStartDownload();
}

function driver(urlsTodo, urlsSoFar, completedBatches, downloadOneBatch) {
    console.log(sprintf('driver: start batch %d with %d urls (%d urls already done)',
            completedBatches + 1, urlsTodo.length, urlsSoFar.length));
    downloadOneBatch(outputDir, urlsTodo, function (allNewUrls) {
        console.log('=== finished the batch with ' + allNewUrls.length + ' new url(s)');
        urlsSoFar = utils.sortAndUniq(urlsSoFar.concat(urlsTodo));
        var reallyNewUrls = utils.without(allNewUrls, urlsSoFar);
        if (reallyNewUrls.length > 0) {
            driver(reallyNewUrls, urlsSoFar, completedBatches + 1, downloadOneBatch);
        }
    });
}

if (numParallelDownload === 1) {
    driver([startUrl], [], 0, downloadOneBatchSeq);
} else {
    driver([startUrl], [], 0, downloadOneBatchParallel);
}
