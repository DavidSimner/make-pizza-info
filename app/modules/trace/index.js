define(['knockoutmapping', 'modules/trace/ViewModelGenerator'], function (mapping, ViewModelGenerator) {
    function TraceViewModel() {
    }

    TraceViewModel.prototype.activate = function () {
    	var self = this;
        return new ViewModelGenerator().get().then(function (data) {
        	mapping.fromJS(data, {}, self);
        });
    };

    return TraceViewModel;
});