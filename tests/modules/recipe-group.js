define(['intern!tdd', 'modules/recipe-group/index'], function (tdd, RecipeGroupViewModel) {
    tdd.suite('modules/recipe-group/index', function () {
        tdd.test('can construct', function () {
            new RecipeGroupViewModel();
        });
    });
});