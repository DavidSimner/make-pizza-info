define(['lodash', 'xr', 'text!modules/trace/CloudFlareDatacentres.json'], function (_, xr, datacentres) {
    datacentres = JSON.parse(datacentres);

    function CloudFlareTraceProvider() {
    }

    CloudFlareTraceProvider.prototype.get = function () {
        return xr.get('/cdn-cgi/trace', undefined, { raw: true }).then(function (value) {
            return _(value.split('\n'))
                .initial()
                .map(function (item) {
                    return item.split('=');
                })
                .zipObject()
                .value();
        }).then(function (value) {
        	return {
        		provider: 'CloudFlare',
        		datacentre: datacentres[value.colo],
        		server: value.fl,
        		scheme: value.visit_scheme,
        		domain: value.h,
        		clients: [ value.ip ]
        	};
        });
    };

    return CloudFlareTraceProvider;
});