define(['intern!tdd', 'intern/chai!expect', 'request-promise'], function (tdd, expect, rp) {
    tdd.suite('web.config', function () {
        function ok (expectedContentType, response) {
            expect(response.complete).to.equal(true);

            expect(response.httpVersion).to.equal('1.1');

            expect(response.statusCode).to.equal(200);
            expect(response.statusMessage).to.equal('OK');

            expect(response.headers).deep.equal({
                'content-length': response.headers['content-length'],
                'date': response.headers.date,
                'etag': response.headers.etag,
                'last-modified': response.headers['last-modified'],

                'accept-ranges': 'bytes',
                'connection': 'close',
                'content-type': expectedContentType,
                'server': 'Microsoft-IIS/8.0',

                'arr-disable-session-affinity': 'true',
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY',
                'x-xss-protection': '1; mode=block',
            });

            expect(response.body).to.be.a('string');
        }

        var okHtml = ok.bind(this, 'text/html');
        var okText = ok.bind(this, 'text/plain');

        var allTestCases = {
            'GET api /humans.txt': okText,
            'GET cdn /humans.txt': okText,
            'GET www /': okHtml,
            'GET www /human': okHtml,
            'GET www /humans': okHtml,
            'GET www /humans.tx': okHtml,
            'GET www /humans.txt': okText,
            'GET www /humans.txt/': okHtml,
            'GET www /humans.txt/2': okHtml,
            'GET www /web.config': okHtml,
        };

        function test (method, uri, assert) {
            return rp({
                    method: method,
                    uri: uri,
                    resolveWithFullResponse: true
                })
                .then(assert);
        }

        for (var testCase in allTestCases) {
            var parts = testCase.split(' ');
            var method = parts[0];
            var uri = 'https://make-pizza-info-' + parts[1] + '.azurewebsites.net' + parts[2];
            var assert = allTestCases[testCase];
            tdd.test(testCase + ' ' + assert.name, test.bind(this, method, uri, assert));
        }
    });
});