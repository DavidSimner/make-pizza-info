define(['xr'], function (xr) {
    function MicrosoftAzureTraceProvider() {
    }

    MicrosoftAzureTraceProvider.prototype.get = function () {
        return xr.get('/trace.json').then(function (value) {
        	return {
        		provider: value.provider,
        		location: value.location,
        		server: value.server,
        		scheme: value.https === 'on' ? 'https' : 'http',
        		domain: value.domain,
        		clients: value.client.match(/[^, ].*?(?=, |$)/g)
        	};
        });
    };

    return MicrosoftAzureTraceProvider;
});