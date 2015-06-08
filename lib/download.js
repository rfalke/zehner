'use strict';

var requests = require('request');
var q = require('q');
var sprintf = require('sprintf-js').sprintf;
var EventEmitter = require('events').EventEmitter;
var filesupport = require('./file_support');
var extraction = require('./extraction');
var utils = require('./utils');
var startsWith = utils.startsWith;
var verbose = false;

function downloadOneUrl(outputDir, url, logPrefix, logPrefix2, logger) {
    var ee = new EventEmitter();

    logger.logStart('%s downloading \'%s\' %s ...', logPrefix, url, logPrefix2);
    var start = Date.now();
    requests(url, function (error, response, body) {
        var duration = (Date.now() - start) / 1000;
        if (error) {
            logger.logFinished('got %s after %.1f seconds', error, duration);
            ee.emit('tempFailed');
        } else if (response.statusCode === 403 || response.statusCode === 404) {
            logger.logFinished('got %d after %.1f seconds', response.statusCode, duration);
            ee.emit('failed');
        } else if (response.statusCode !== 200) {
            logger.logFinished('got %d after %.1f seconds', response.statusCode, duration);
            ee.emit('tempFailed');
        } else if (startsWith(response.request.href, 'http://navigationshilfe1.t-online.de/dnserror?')) {
            logger.logFinished('got bad dns after %.1f seconds', duration);
            ee.emit('failed');
        } else {
            logger.logFinished('got %s bytes in %.1f seconds (%s)',
                utils.formatBytes(body.length), duration, utils.formatRate(body.length, duration));
            var fname = filesupport.writeResponseToFile(outputDir, body, url);

            logger.logOther('    saved to %s', fname);
            var links = extraction.extractLinks(url, body);
            if (verbose) {
                console.log('Got the following links:');
                console.log(links);
            }
            ee.emit('success', links);
        }
    });
    return ee;
}

function downloadOneUrlWithRetryRec(outputDir, url, retry, numRetries, logPrefix, defer, logger) {
    var ee = downloadOneUrl(outputDir, url, logPrefix, sprintf('%d/%d: ', retry + 1, numRetries), logger);
    ee.on('success', function (urls) {
        defer.resolve(urls);
    }).on('failed', function () {
        logger.logOther('    *** failed to download \'%s\'', url);
        defer.reject();
    }).on('tempFailed', function () {
        if (retry === numRetries - 1) {
            defer.reject();
        } else {
            downloadOneUrlWithRetryRec(outputDir, url, retry + 1, numRetries, logPrefix, defer, logger);
        }
    });
    return defer.promise;
}

function downloadOneUrlWithRetry(outputDir, url, numRetries, logPrefix, logger) {
    console.assert(numRetries > 0);
    return downloadOneUrlWithRetryRec(outputDir, url, 0, numRetries, logPrefix, q.defer(), logger);
}

module.exports = {
    downloadOneUrlWithRetry: downloadOneUrlWithRetry
};
