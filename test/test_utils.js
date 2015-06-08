'use strict';

var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function () {
    it('format bytes', function () {
        assert.equal(utils.formatBytes(0), '0');
        assert.equal(utils.formatBytes(1), '1');
        assert.equal(utils.formatBytes(12), '12');
        assert.equal(utils.formatBytes(123), '123');
        assert.equal(utils.formatBytes(1234), '1,234');
        assert.equal(utils.formatBytes(12345), '12,345');
        assert.equal(utils.formatBytes(123456), '123,456');
        assert.equal(utils.formatBytes(1234567), '1,234,567');
    });
    it('format rate', function () {
        assert.equal(utils.formatRate(12345, 0), '--.- K/s');
        assert.equal(utils.formatRate(12595, 1), '12.3 K/s');
        assert.equal(utils.formatRate(6.2 * 2048, 2), '6.2 K/s');
    });
});
