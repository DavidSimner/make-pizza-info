define(['intern!tdd', 'modules/contact/index'], function (tdd, ContactViewModel) {
    tdd.suite('modules/contact/index', function () {
        tdd.test('can construct', function () {
            new ContactViewModel();
        });
    });
});