define(['xr'], function (xr) {
    function TraceViewModel() {
    }

    TraceViewModel.prototype.activate = function () {
        return xr.get('/trace.json');
    };

    return TraceViewModel;
});