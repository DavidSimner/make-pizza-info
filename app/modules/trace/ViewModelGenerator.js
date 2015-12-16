define(['lodash', 'modules/trace/CloudFlareTraceProvider', 'modules/trace/MicrosoftAzureTraceProvider'], function (_, CloudFlareTraceProvider, MicrosoftAzureTraceProvider) {
	function ViewModelGenerator() {
	}

	function generateLocation (location) {
		if (location) {
			return [ location.name, location.city, location.state, location.country, location.region ].filter(function (x) {
				return x;
			}).join(', ');
		} else {
			return undefined;
		}
	}

	function generateIpAddress (ipAddress, server) {
		if (ipAddress && server) {
			return ipAddress + ' (' + server + ')';
		} else if (ipAddress) {
			return ipAddress;
		} else if (server) {
			return server;
		} else {
			return undefined;
		}
	}

	function generateUrl (scheme, domain) {
		if (scheme && domain) {
			return scheme + '://' + domain;
		} else if (scheme) {
			return scheme;
		} else if (domain) {
			return domain;
		} else {
			return undefined;
		}
	}

	ViewModelGenerator.prototype.get = function () {
		var ret = [];
		var current;
		var todo = [];
		var traceProviders = [ new CloudFlareTraceProvider() ];

		var processValueAndStartNextTodo = function (value) {
			ret.unshift({
				provider: value.provider,
				location: generateLocation(value.location),
				ipAddress: generateIpAddress(current, value.server),
				url: generateUrl(value.scheme, value.domain)
			});

			if (value.clients) {
				value.clients.forEach(function (client) {
					if (todo.indexOf(client) === -1) {
						todo.push(client);
					}
				});
			}

			if (todo.length === 0) {
				return ret;
			}
			current = todo.pop();

			var ipAddress = current.split(':')[0];
			var chosenTraceProvider = _.find(traceProviders, function (x) {
				return x.canGet(ipAddress);
			});
			return chosenTraceProvider ? chosenTraceProvider.get(ipAddress).then(processValueAndStartNextTodo)
									   : processValueAndStartNextTodo({});
		};

		return new MicrosoftAzureTraceProvider().get().then(processValueAndStartNextTodo);
	};

	return ViewModelGenerator;
});