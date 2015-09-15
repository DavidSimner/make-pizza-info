define(['intern!tdd', 'modules/trace/index'], function (tdd, TraceViewModel) {
    tdd.suite('modules/trace/index', function () {
        tdd.test('can construct', function () {
            new TraceViewModel();
        });
    });
});