define(['intern!object', 'widgets/header/viewmodel'], function (registerSuite, HeaderViewModel) {
    registerSuite({
        'can construct': function () {
            new HeaderViewModel();
        }
    });
});