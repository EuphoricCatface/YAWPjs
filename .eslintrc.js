module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "ecmaFeatures": {
        // env=es6 doesn't include modules, which we are using
        "modules": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "globals": {
        "HTMLActuator": true,
        "inputManager": true,
        "Grid": true,
        "Tile": true,
        "Validator": true,
        "GameManager": true
    },
    "rules": {
        "semi": [ 2, "always" ]
    }
};
