"use strict";

var assert = require("assert");
var utils = require("../utils");

describe('utils', function () {
    it("format bytes", function () {
        assert.equal(utils.format_bytes(0), "0");
        assert.equal(utils.format_bytes(1), "1");
        assert.equal(utils.format_bytes(12), "12");
        assert.equal(utils.format_bytes(123), "123");
        assert.equal(utils.format_bytes(1234), "1,234");
        assert.equal(utils.format_bytes(12345), "12,345");
        assert.equal(utils.format_bytes(123456), "123,456");
        assert.equal(utils.format_bytes(1234567), "1,234,567");
    });
    it("format rate", function () {
        assert.equal(utils.format_rate(12345, 0), "--.- K/s");
        assert.equal(utils.format_rate(12595, 1), "12.3 K/s");
        assert.equal(utils.format_rate(6.2 * 2048, 2), "6.2 K/s");
    });
});
