define(['modules/trace/MicrosoftAzureTraceProvider'], function (MicrosoftAzureTraceProvider) {
    function TraceViewModel() {
    }

    TraceViewModel.prototype.activate = function () {
        return new MicrosoftAzureTraceProvider().get();
    };

    return TraceViewModel;
});