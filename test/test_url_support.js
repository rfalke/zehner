'use strict';

var assert = require('assert');
var urlsupport = require('../lib/url_support');

describe('url support', function () {
    var full = 'http://www.example.com/abc/dec';
    var makeLinkAbsolute = urlsupport.makeLinkAbsolute;
    it('make link absolute', function () {
        assert.equal(makeLinkAbsolute(full, 'http://www.otherhost/foo'), 'http://www.otherhost/foo');
        assert.equal(makeLinkAbsolute(full, '/foo/bar'), 'http://www.example.com/foo/bar');
        assert.equal(makeLinkAbsolute(full, 'foo/bar'), 'http://www.example.com/abc/foo/bar');

        assert.equal(makeLinkAbsolute(full, 'http://www.otherhost/foo#xyz'), 'http://www.otherhost/foo');
        assert.equal(makeLinkAbsolute(full, '/foo/bar#xyz'), 'http://www.example.com/foo/bar');
        assert.equal(makeLinkAbsolute(full, 'foo/bar#xyz'), 'http://www.example.com/abc/foo/bar');

        assert.equal(makeLinkAbsolute(full, '/foo/././bar'), 'http://www.example.com/foo/bar');
        assert.equal(makeLinkAbsolute(full, '/foo/.'), 'http://www.example.com/foo/DOT');
        assert.equal(makeLinkAbsolute(full, 'http://otherhost'), 'http://otherhost/');

        assert.equal(makeLinkAbsolute(full, '//newhost/some/path'), 'http://newhost/some/path');
        assert.equal(makeLinkAbsolute(full, '//newhost'), 'http://newhost/');

        assert.equal(makeLinkAbsolute(full, '/a/b/c/./../../g?foo=..'), 'http://www.example.com/a/g?foo=..');
        assert.equal(makeLinkAbsolute(full, 'mid/content=5/../6'), 'http://www.example.com/abc/mid/6');
    });
});
