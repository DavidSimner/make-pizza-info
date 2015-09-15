define(['intern!tdd', 'modules/recipe/index'], function (tdd, RecipeViewModel) {
    tdd.suite('modules/recipe/index', function () {
        tdd.test('can construct', function () {
            new RecipeViewModel();
        });
    });
});