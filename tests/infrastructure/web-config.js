define(['intern!tdd', 'intern/chai!expect', 'request-promise'], function (tdd, expect, rp) {
    tdd.suite('web.config', function () {
        function expects (expectedStatusCode, expectedStatusMessage, expectedCacheControl, expectedContentType, response) {
            expect(response.complete).to.equal(true);

            expect(response.httpVersion).to.equal('1.1');

            expect(response.statusCode).to.equal(expectedStatusCode);
            expect(response.statusMessage).to.equal(expectedStatusMessage);

            var expectedHeaders = {
                'content-length': response.headers['content-length'],
                'date': response.headers.date,

                'connection': 'close',
                'server': 'Microsoft-IIS/8.0',

                'arr-disable-session-affinity': 'true',
                'content-security-policy': "style-src https://cdn.make-pizza.info/css/; sandbox allow-scripts allow-same-origin; script-src https://cdn.make-pizza.info/js/ 'unsafe-eval'; connect-src https://make-pizza.info/trace.json; default-src 'none'; base-uri 'none'; form-action 'none'; referrer no-referrer; frame-ancestors 'none'; reflected-xss block",
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY',
                'x-xss-protection': '1; mode=block',
            };
            if (expectedCacheControl) {
                expectedHeaders['accept-ranges'] = 'none';

                expectedHeaders['cache-control'] = expectedCacheControl;
            }
            else if (expectedStatusCode === 200) {
                expectedHeaders.etag = response.headers.etag;
                expectedHeaders['last-modified'] = response.headers['last-modified'];

                expectedHeaders['accept-ranges'] = 'bytes';
            }
            if (expectedContentType) {
                expectedHeaders['content-type'] = expectedContentType;
            }
            expect(response.headers).to.deep.equal(expectedHeaders);

            expect(response.body).to.be.a('string');
            if (!expectedContentType) {
                expect(response.body).to.equal('');
            }
        }

        var ok = expects.bind(this, 200, 'OK');
        var notFound = expects.bind(this, 404, 'Not Found', undefined, undefined);

        var okPublic = ok.bind(this, undefined);
        var okPrivate = ok.bind(this, 'no-store');

        var okCss = okPublic.bind(this, 'text/css; charset=utf-8');
        var okHtml = okPublic.bind(this, 'text/html; charset=utf-8');
        var okIcon = okPublic.bind(this, 'image/x-icon');
        var okJavascript = okPublic.bind(this, 'application/x-javascript; charset=utf-8');
        var okText = okPublic.bind(this, 'text/plain; charset=utf-8');

        var okPrivateJson = okPrivate.bind(this, 'application/json; charset=utf-8');

        function testSinglePageApp (response) {
            okHtml(response);

            var linkHref = response.body.match(/<link rel="stylesheet" href=".*(\/css\/.+)">/)[1];
            var linkUri = 'https://make-pizza-info-cdn.azurewebsites.net' + linkHref;
            var linkPromise = test('GET', linkUri, okCss);

            var scriptSrc = response.body.match(/<script src=".*(\/js\/.+)"><\/script>/)[1];
            var scriptUri = 'https://make-pizza-info-cdn.azurewebsites.net' + scriptSrc;
            var scriptPromise = test('GET', scriptUri, okJavascript);

            return Promise.all([linkPromise, scriptPromise]);
        }

        var allTestCases = {
            'GET api /': notFound,
            'GET api /humans.txt': okText,
            'GET api /t': notFound,
            'GET api /trace.json': okPrivateJson,

            'GET cdn /': notFound,
            'GET cdn /humans.txt': okText,
            'GET cdn /j': notFound,
            'GET cdn /js': notFound,
            'GET cdn /js/': notFound,
            'GET cdn /js/h': notFound,
            'GET cdn /trace.json': okPrivateJson,

            'GET www /': testSinglePageApp,
            'GET www /favicon.ico': okIcon,
            'GET www /human': okHtml,
            'GET www /humans': okHtml,
            'GET www /humans.tx': okHtml,
            'GET www /humans.txt': okText,
            'GET www /humans.txt/': okHtml,
            'GET www /humans.txt/2': okHtml,
            'GET www /trace.json': okPrivateJson,
            'GET www /web.config': okHtml,
        };

        function test (method, uri, assert) {
            return rp({
                    method: method,
                    uri: uri,
                    simple: false,
                    followRedirect: false,
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