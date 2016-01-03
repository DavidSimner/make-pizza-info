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
                'content-security-policy': "style-src https://cdn.make-pizza.info/css/; sandbox allow-scripts allow-same-origin; script-src https://cdn.make-pizza.info/js/ 'unsafe-eval'; connect-src https://make-pizza.info/trace.json https://make-pizza.info/cdn-cgi/trace; default-src 'none'; base-uri 'none'; form-action 'none'; referrer no-referrer; frame-ancestors 'none'; reflected-xss block",
                'strict-transport-security': 'max-age=15552000; includeSubDomains; preload',
                'vary': 'Accept, Accept-Encoding, Origin',
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY',
                'x-xss-protection': '1; mode=block',
            };
            if (expectedCacheControl) {
                expectedHeaders['accept-ranges'] = 'none';

                delete expectedHeaders.vary;

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
            if (response.request.method !== 'HEAD') {
                var contentType = response.headers['content-type'];
                var bodyLength = contentType && contentType.includes('utf-8') ? unescape(encodeURIComponent(response.body)).length
                                                                              : response.body.length;
                expect(bodyLength.toString()).to.equal(response.headers['content-length']);
            }
            if (!expectedContentType) {
                expect(response.body).to.equal('');
            }
        }

        var ok = expects.bind(this, 200, 'OK');
        var notFoundThatIsBlank = expects.bind(this, 404, 'Not Found', undefined, undefined);
        var methodNotAllowed = expects.bind(this, 404, 'Not Found', undefined, 'text/html');
        var notAcceptable = expects.bind(this, 406, 'Not Acceptable', undefined, 'text/html');
        var notAcceptableThatIsBlank = expects.bind(this, 406, 'Not Acceptable', undefined, undefined);

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

            var linkHref = response.body.match(/<link rel="stylesheet" href=".*(\/css\/.+?)"/)[1];
            var linkUri = 'https://make-pizza-info-cdn.azurewebsites.net' + linkHref;
            var linkPromise = test('GET', linkUri, undefined, okCss);

            var scriptSrc = response.body.match(/<script src=".*(\/js\/.+?)"/)[1];
            var scriptUri = 'https://make-pizza-info-cdn.azurewebsites.net' + scriptSrc;
            var scriptPromise = test('GET', scriptUri, undefined, okJavascript);

            return Promise.all([linkPromise, scriptPromise]);
        }

        var allTestCases = {
            'GET api /': notFoundThatIsBlank,
            'GET api / text/plain': notFoundThatIsBlank,
            'GET api / text/html': notFoundThatIsBlank,
            'GET api /humans.txt': okText,
            'GET api /humans.txt text/plain': okText,
            'GET api /humans.txt text/html': notAcceptable,
            'GET api /humans.txt/': notFoundThatIsBlank,
            'GET api /t': notFoundThatIsBlank,
            'GET api /trace.json': okPrivateJson,
            'GET api /trace.json application/json': okPrivateJson,
            'GET api /trace.json application/xml': notAcceptable,
            'GET api /web.config': notFoundThatIsBlank,

            'GET cdn /': notFoundThatIsBlank,
            'GET cdn / text/plain': notFoundThatIsBlank,
            'GET cdn / text/html': notFoundThatIsBlank,
            'GET cdn /humans.txt': okText,
            'GET cdn /humans.txt text/plain': okText,
            'GET cdn /humans.txt text/html': notAcceptable,
            'GET cdn /humans.txt/': notFoundThatIsBlank,
            'GET cdn /j': notFoundThatIsBlank,
            'GET cdn /js': notFoundThatIsBlank,
            'GET cdn /js/': notFoundThatIsBlank,
            'GET cdn /js/h': notFoundThatIsBlank,
            'GET cdn /trace.json': okPrivateJson,
            'GET cdn /trace.json application/json': okPrivateJson,
            'GET cdn /trace.json application/xml': notAcceptable,
            'GET cdn /web.config': notFoundThatIsBlank,

            'GET www /': testSinglePageApp,
            'GET www / text/plain': notAcceptableThatIsBlank,
            'GET www / text/html': notAcceptableThatIsBlank,
            'GET www /favicon.ico': okIcon,
            'GET www /human': okHtml,
            'GET www /humans': okHtml,
            'GET www /humans.': okHtml,
            'GET www /humans.tx': okHtml,
            'GET www /humans.txt': okText,
            'GET www /humans.txt text/plain': okText,
            'GET www /humans.txt text/html': notAcceptable,
            'GET www /humans.txt/': okHtml,
            'GET www /humans.txt/2': okHtml,
            'GET www /trace.json': okPrivateJson,
            'GET www /trace.json application/json': okPrivateJson,
            'GET www /trace.json application/xml': notAcceptable,
            'GET www /web.config': okHtml,
        };
        ['HEAD', 'POST',
         'OPTIONS', 'PUT', 'DELETE', 'TRACE',
         'PATCH',
         'PROPFIND', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK', 'UNLOCK'].forEach(function (method) {
            ['api', 'cdn', 'www'].forEach(function (site) {
                ['/', '/humans.txt', '/humans.txt/', '/NotFound'].forEach(function (uri) {
                    allTestCases[method + ' ' + site + ' ' + uri] = methodNotAllowed;
                });
            });
        });

        function test (method, uri, acceptHeader, assert) {
            return rp({
                    method: method,
                    uri: uri,
                    headers: {
                        'Accept': acceptHeader
                    },
                    gzip: true,
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
            var acceptHeader = parts[3];
            var assert = allTestCases[testCase];
            tdd.test(testCase + ' ' + assert.name, test.bind(this, method, uri, acceptHeader, assert));
        }
    });
});