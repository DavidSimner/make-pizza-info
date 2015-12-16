define(['lodash', 'xr', 'modules/trace/IpAddressRange', 'text!modules/trace/CloudFlareDatacentres.json', 'text!modules/trace/CloudFlareIpAddressRanges.json'], function (_, xr, IpAddressRange, datacentres, ipAddressRanges) {
    datacentres = JSON.parse(datacentres);
    ipAddressRanges = JSON.parse(ipAddressRanges);

    function CloudFlareTraceProvider() {
    }

    CloudFlareTraceProvider.prototype.canGet = function (ipAddress) {
        return ipAddressRanges.some(function (x) {
            return new IpAddressRange(x).contains(ipAddress);
        });
    };

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
        		location: datacentres[value.colo],
        		server: value.fl,
        		scheme: value.visit_scheme,
        		domain: value.h,
        		clients: [ value.ip ]
        	};
        });
    };

    return CloudFlareTraceProvider;
});