"use strict";

var assert = require("assert");
var nock = require('nock');
var os = require("os");
var fs = require("fs");
var download = require("../download");

describe('download', function () {
    function rm_r(dir) {
        fs.readdirSync(dir).forEach(function (name) {
            name = dir + "/" + name;
            if (fs.statSync(name).isDirectory()) {
                rm_r(name);
            } else {
                fs.unlinkSync(name);
            }
        });
        fs.rmdirSync(dir);
    }

    describe('file support', function () {
        var tmpDir;

        beforeEach(function () {
            tmpDir = os.tmpdir() + "/testing_" + os.uptime();
            fs.mkdirSync(tmpDir);
        });
        afterEach(function () {
            rm_r(tmpDir);
        });
        it("402 will be retried and 3 times 402 results in error", function (done) {
            var nocked = nock('http://www.example.com').get('/foo').times(3).reply(402);
            var promise = download.downloadOneUrlWithRetry(tmpDir, "http://www.example.com/foo", 3, "3/14");
            promise.then(
                function () {
                    assert.fail();
                },
                function () {
                    nocked.done();
                    done();
                }
            );
        });
        it("402 will be retried and 2 times 402 + 200 is ok", function (done) {
            var nocked = nock('http://www.example.com').get('/foo').times(2).reply(402).
                get("/foo").reply(200);
            var promise = download.downloadOneUrlWithRetry(tmpDir, "http://www.example.com/foo", 3, "3/14");
            promise.then(
                function () {
                    nocked.done();
                    done();
                },
                function () {
                    assert.fail();
                }
            );
        });
        it("404 will not be retried and results in error", function (done) {
            var nocked = nock('http://www.example.com').get('/foo').reply(404);
            var promise = download.downloadOneUrlWithRetry(tmpDir, "http://www.example.com/foo", 3, "3/14");
            promise.then(
                function () {
                    assert.fail();
                },
                function () {
                    nocked.done();
                    done();
                }
            );
        });
        it("unknown dns will cause an error", function (done) {
            var nocked = nock('http://www.example.com').get('/foo').reply(302, "", {"Location": "http://navigationshilfe1.t-online.de/dnserror?url=http://www.example.com/foo"});
            var promise = download.downloadOneUrlWithRetry(tmpDir, "http://www.example.com/foo", 3, "3/14");
            promise.then(
                function () {
                    assert.fail();
                },
                function () {
                    nocked.done();
                    done();
                }
            );
        });
    });
});
