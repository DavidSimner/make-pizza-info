define(['intern!object', 'modules/home/index'], function (registerSuite, HomeViewModel) {
    registerSuite({
        'can construct': function () {
            new HomeViewModel();
        }
    });
});