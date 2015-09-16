define(['intern!tdd', 'intern/chai!expect', 'request-promise'], function (tdd, expect, rp) {
    tdd.suite('web.config', function () {
        function ok (response) {
            expect(response.complete).to.equal(true);

            expect(response.httpVersion).to.equal('1.1');

            expect(response.statusCode).to.equal(200);
            expect(response.statusMessage).to.equal('OK');

            expect(response.headers).deep.equal({
                'content-length': response.headers['content-length'],
                'date': response.headers.date,
                'etag': response.headers.etag,
                'last-modified': response.headers['last-modified'],
                'set-cookie': response.headers['set-cookie'],

                'accept-ranges': 'bytes',
                'connection': 'close',
                'content-type': 'text/plain',
                'server': 'Microsoft-IIS/8.0',
                'x-powered-by': 'ASP.NET',
            });

            expect(response.body).to.be.a('string');
        }

        var allTestCases = {
            'GET api /humans.txt': ok,
            'GET cdn /humans.txt': ok,
            'GET www /humans.txt': ok,
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