const assert = require('assert');
const config = require('config');
const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const wdio = require('webdriverio');
const passwordGenerator = require('niceware');
const owasp = require('owasp-password-strength-test');

const opts = config.get('appium');

const random = (low, high) => Math.random() * (high - low) + low;

const evaluatePasswordStrength = (password) => {
    console.log('Evaluating password strength');
    owasp.config({
        allowPassphrases: false, // this turns optional tests to required tests. See owasp code.
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

const generatePassword = () => {
    console.log('Generating password.');
    const passwordArray = passwordGenerator.generatePassphrase(4); // setting bytes to 4 produces two word passwords. Other occurances have been updated.
    const password = diversify(passwordArray);
    return password;
};

const getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function');

describe('*** INTEGRATION TEST JUPITER APP ***', () => {

    let client;
    before(async () => {
        client = await wdio.remote(opts);
    })

    const updateField = async (field, updateValue) => {
        const defaultText = await field.getText();
        if (defaultText || defaultText.length > 0) {
            defaultText.split('').forEach(() => {
                client.sendKeyEvent('67');
            });
        };

        await field.sendKeys([updateValue]);
        await client.sendKeyEvent('23');
    };

    // todo: add more assertions per layout
    it.only('Handles user registration, initial deposit, and subsequent login', async () => {

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';

        const field = await client.$(xpath);

        const visible = await field.isDisplayed();
        console.log('Console log works?');
        assert(visible);

        const button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        assert(await button.getText(), 'NEXT');
        button.click();
        
        assert(await button.getText(), 'NEXT');
        button.click();

        assert(await button.getText(), 'NEXT');
        button.click();

        assert(await button.getText(), 'START SAVING');    
        button.click();
        
        const continueButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView');
        assert(await continueButton.getText(), 'CONTINUE');
        continueButton.click();

        await new Promise(done => setTimeout(done, 5000));

        const emailField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.widget.EditText');
        emailField.click();
        await updateField(emailField, `testemail${Math.trunc(random(1000, 100000))}@test.tst`);

        const idField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText');
        idField.click();
        await updateField(idField, Math.trunc(random(1000000000000, 10000000000000)).toString());
        
        const contButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView');
        assert(await contButton.getText(), 'CONTINUE');
        contButton.click();

        await new Promise(done => setTimeout(done, 2000));

        const testPassword = generatePassword();

        const reTypePwdField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText');
        reTypePwdField.click();
        await updateField(reTypePwdField, testPassword);

        await client.sendKeyEvent('4');        

        const passwordField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.EditText'); 
        passwordField.click();
        await updateField(passwordField, testPassword);

        await client.sendKeyEvent('4');

        const continueButton3 = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView');
        continueButton3.click();

        await new Promise(done => setTimeout(done, 5000));

        const amountField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.EditText');
        amountField.click();
        await updateField(amountField, random(100, 10000).toFixed(2).toString());

        await client.sendKeyEvent('4');

        const nextPayment = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView');
        await nextPayment.click();

        await new Promise(done => setTimeout(done, 5000));

        const paidBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup[2]/android.widget.TextView');
        await paidBtn.click();

        await new Promise(done => setTimeout(done, 3000));

        const doneBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.widget.TextView');
        await doneBtn.click();

        // todo use same user to login (as opposed to logging in via test defaults)
        const login = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        await login.click();

        // todo: assert whether login results in otp or home page, handle accordingly

        await new Promise(done => setTimeout(done, 5000))

        await client.sendKeyEvent('111');

        // await client.deleteSession();
    });

    it('Handles user registration where user uses randomly generated password', async () => {
        const client = await wdio.remote(opts);

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';

        const field = await client.$(xpath);

        const visible = await field.isDisplayed();
        assert(visible);

        const button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        assert(await button.getText(), 'NEXT');
        button.click();
        
        assert(await button.getText(), 'NEXT');
        button.click();

        assert(await button.getText(), 'NEXT');
        button.click();

        assert(await button.getText(), 'START SAVING');    
        button.click();
        
        const continueButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView');
        assert(await continueButton.getText(), 'CONTINUE');
        continueButton.click();

        await new Promise(done => setTimeout(done, 5000));

        const emailField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.widget.EditText');
        emailField.click();
        await updateField(emailField, `testemail${random(100, 1000)}@test.tst`);

        const idField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText');
        idField.click();
        await updateField(idField, random(1000000000000, 10000000000000).toString());
        
        const contButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView');
        assert(await contButton.getText(), 'CONTINUE');
        contButton.click();

        await new Promise(done => setTimeout(done, 2000));

        const generatePwdBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView[2]');
        console.log('found text:', await generatePwdBtn.getText());
        generatePwdBtn.click();

        await new Promise(done => setTimeout(done, 2000));

        const scrollView = await client.elementByAccessibilityId('element-6066-11e4-a52e-4f735466cecf');


        await client.sendKeyEvent('16');
        await client.sendKeyEvent('16');

        // const continueButton3 = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView');
        // continueButton3.click();
        await client.deleteSession();
    });

    it('Handles user login properly', async() => {
        const client = await wdio.remote(opts);

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';
        const field = await client.$(xpath);
        const visible = await field.isDisplayed();
        console.log('Console log works?');
        assert(visible);
        const text = await field.getText();
        const button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'START SAVING');    
        button.click();
        const login = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[4]');

        console.log('login text: ', await login.getText());

        // Selecting clickable subtext that has no unique identifier is the making of a Jedi

        // However, working with an element inspector that does not recognize buttons on pop ups is the making of a Sith Lord

    });

});
