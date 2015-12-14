define(['xr'], function (xr) {
    function MicrosoftAzureTraceProvider() {
    }

    MicrosoftAzureTraceProvider.prototype.get = function () {
        return xr.get('/trace.json');
    };

    return MicrosoftAzureTraceProvider;
});