'use strict';

const passwordGenerator = require('niceware');
const owasp = require('owasp-password-strength-test');

const random = (low, high) => Math.random() * (high - low) + low;

const evaluatePasswordStrength = (password) => {
    console.log('Evaluating password strength');
    owasp.config({
        allowPassphrases: false,
        maxLength: 128,
        minLength: 8,
        minPhraseLength: 12,
        minOptionalTestsToPass: 4
    });
    const result = owasp.test(password);
    return result;
};

const diversify = (stringArray) => {
    console.log('Randomizing password');
    const randomizedArray = [];
    for (let i = 0; i < stringArray.length; i++) {
        const randomFloat = Math.random();
        if (randomFloat > 0.5) {
            randomizedArray.push(stringArray[i].toUpperCase());
        } else {
            randomizedArray.push(stringArray[i]);
        }
    }
    const randomizedString = randomizedArray.join('_') + Math.trunc(random(1, 1000));
    const passwordStrength = evaluatePasswordStrength(randomizedString);
    console.log(passwordStrength);
    if (passwordStrength.errors.length > 0) {
        console.log('Strengthening generated password.');
        return diversify(stringArray);
    }
    return randomizedString;
};

module.exports.generatePassword = () => {
    console.log('Generating password.');
    const passwordArray = passwordGenerator.generatePassphrase(4);
    const password = diversify(passwordArray);
    return password;
};

module.exports.testProps = (id) => ({ id: id, accessabilityLabel: id });

module.exports.assembleXPath = (elementType, accessabilityId) => {
    switch (elementType) {
        case 'EditText':
            return `//android.widget.EditText[@content-desc="${accessabilityId}"]`
        case 'ViewGroup':
            // currently, the inconsistency of the '/android.view.View' postfix hinders this use case.
            return `//android.view.ViewGroup[@content-desc="${accessabilityId}"]/android.view.View`
    }
};
