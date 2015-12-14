define(['xr'], function (xr) {
    function MicrosoftAzureTraceProvider() {
    }

    MicrosoftAzureTraceProvider.prototype.get = function () {
        return xr.get('/trace.json').then(function (value) {
        	return {
        		provider: value.provider,
        		datacentre: value.datacentre,
        		server: value.server,
        		https: value.https,
        		domain: value.domain,
        		client: value.client
        	};
        });
    };

    return MicrosoftAzureTraceProvider;
});