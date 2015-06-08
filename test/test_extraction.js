"use strict";

var assert = require("assert");
var extraction = require("../lib/extraction");

describe('extraction', function () {
    var url = "http://www.example.com/abc/dec";

    var extract_links = extraction.extract_links;
    it("extract links", function () {
        assert.deepEqual(extract_links(url, "HREF=\"link1\" href=\"mailto:foo@bar.com\" <img src=\"http://www.foobar.com/pixel.gif\" /> <body background=\"/background.png\""), ["http://www.example.com/abc/link1", "http://www.example.com/background.png", "http://www.foobar.com/pixel.gif"]);
        assert.deepEqual(extract_links(url, "HREF=\"link1\" href=\"link1\""), ["http://www.example.com/abc/link1"]);
        assert.deepEqual(extract_links(url, "href=\"mailto:foo@bar.com\""), []);
        assert.deepEqual(extract_links(url, "href=\"javascript:void(0)\""), []);
        assert.deepEqual(extract_links(url, "href=\"#\""), []);
        assert.deepEqual(extract_links(url, "some text hr_ef=\"link1\""), []);
        assert.deepEqual(extract_links(url, "<img src=\"///C:\\Users\\foo\\bar.gif\" />"), []);
    });
});
