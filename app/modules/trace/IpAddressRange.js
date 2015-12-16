define([], function () {
	function ipAddressToInt (value) {
		var parts = value.split('.');
		return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
	}

    function IpAddressRange(value) {
    	var parts = value.split('/');

    	this.begin = ipAddressToInt(parts[0]);
    	this.end = this.begin + (1 << (32 - parts[1])) - 1;
    }

    IpAddressRange.prototype.contains = function (value) {
    	var current = ipAddressToInt(value);

        return this.begin <= current && current <= this.end;
    };

    return IpAddressRange;
});