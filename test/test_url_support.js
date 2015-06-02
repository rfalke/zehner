"use strict";

var assert = require("assert");
var url_support = require("../url_support");

describe('url support', function () {
    var full = "http://www.example.com/abc/dec";
    var make_link_absolute = url_support.make_link_absolute;
    it("make link absolute", function () {
        assert.equal(make_link_absolute(full, "http://www.otherhost/foo"), "http://www.otherhost/foo");
        assert.equal(make_link_absolute(full, "/foo/bar"), "http://www.example.com/foo/bar");
        assert.equal(make_link_absolute(full, "foo/bar"), "http://www.example.com/abc/foo/bar");

        assert.equal(make_link_absolute(full, "http://www.otherhost/foo#xyz"), "http://www.otherhost/foo");
        assert.equal(make_link_absolute(full, "/foo/bar#xyz"), "http://www.example.com/foo/bar");
        assert.equal(make_link_absolute(full, "foo/bar#xyz"), "http://www.example.com/abc/foo/bar");

        assert.equal(make_link_absolute(full, "/foo/././bar"), "http://www.example.com/foo/bar");
        assert.equal(make_link_absolute(full, "/foo/."), "http://www.example.com/foo/DOT");
        assert.equal(make_link_absolute(full, "http://otherhost"), "http://otherhost/");

        assert.equal(make_link_absolute(full, "//newhost/some/path"), "http://newhost/some/path");
        assert.equal(make_link_absolute(full, "//newhost"), "http://newhost/");

        assert.equal(make_link_absolute(full, "/a/b/c/./../../g?foo=.."), "http://www.example.com/a/g?foo=..");
        assert.equal(make_link_absolute(full, "mid/content=5/../6"), "http://www.example.com/abc/mid/6");
    });
});
