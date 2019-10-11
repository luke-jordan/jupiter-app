const assert = require('assert');
const config = require('config');
// const sinon = require('sinon');
// const chai = require('chai');
// chai.use(require('sinon-chai'));
// const expect = chai.expect;

const wdio = require('webdriverio');
const testUtil = require('./util');

const opts = config.get('appium');

const random = (low, high) => Math.random() * (high - low) + low;

describe('*** INTEGRATION TEST JUPITER APP ***', () => {

    let client;
    before(async () => {
        client = await wdio.remote(opts);
    });

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

    // todo: add more assertions per layout, swap out assert for chai expect
    it.only('Handles user registration, initial deposit, and subsequent login', async () => {

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';

        const field = await client.$(xpath);

        const visible = await field.isDisplayed();
        assert(visible);

        // const button = await client.findElement('id', 'onboarding-button');
        const button = await client.$('//android.view.ViewGroup[@content-desc="onboarding-button"]/android.view.View');
        // assert(await button.getText(), 'NEXT');
        button.click();
        
        // assert(await button.getText(), 'NEXT');
        button.click();

        // assert(await button.getText(), 'NEXT');
        button.click();

        // assert(await button.getText(), 'START SAVING');    
        button.click();
        
        // const continueButton1 = await client.findElement('id', 'limited-users-button');
        const continueButton1 = await client.$('//android.view.ViewGroup[@content-desc="limited-users-button"]/android.view.View');
        // assert(await continueButton1.getText(), 'CONTINUE');
        continueButton1.click();

        await new Promise(done => setTimeout(done, 5000));

        // const emailField = await client.findElement('id', 'register-email-or-phone');
        const emailField = await client.$('//android.widget.EditText[@content-desc="register-email-or-phone"]');
        emailField.click();
        await updateField(emailField, `testemail${Math.trunc(random(1000, 100000))}@test.tst`);

        // const idField = await client.findElement('id', 'register-id-number');
        const idField = await client.$('//android.widget.EditText[@content-desc="register-id-number"]');
        idField.click();
        await updateField(idField, Math.trunc(random(1000000000000, 10000000000000)).toString());

        await client.sendKeyEvent('4');
        
        // const continueButton2 = await client.findElement('id', 'register-continue-btn');
        const continueButton2 = await client.$('//android.view.ViewGroup[@content-desc="register-continue-btn"]/android.view.View');
        // assert(await continueButton2.getText(), 'CONTINUE');
        continueButton2.click();

        await new Promise(done => setTimeout(done, 2000));

        const testPassword = testUtil.generatePassword();

        // const reTypePwdField = await client.findElement('id', 'set-password-input-2');
        const reTypePwdField = await client.$('//android.widget.EditText[@content-desc="set-password-input-2"]');
        reTypePwdField.click();
        await updateField(reTypePwdField, testPassword);

        await client.sendKeyEvent('4');       

        // const passwordField = await client.findElement('id', 'set-password-input-1');
        const passwordField = await client.$('//android.widget.EditText[@content-desc="set-password-input-1"]'); 
        passwordField.click();
        await updateField(passwordField, testPassword);

        await client.sendKeyEvent('4');

        // const continueButton3 = await client.findElement('id', 'set-password-continue-btn');
        const continueButton3 = await client.$('//android.view.ViewGroup[@content-desc="set-password-continue-btn"]/android.view.View');
        continueButton3.click();

        await new Promise(done => setTimeout(done, 5000));

        // const amountField = await client.findElement('id', 'add-cash-input');        
        const amountField = await client.$('//android.widget.EditText[@content-desc="add-cash-input"]');
        amountField.click();
        await updateField(amountField, random(100, 10000).toFixed(2).toString());

        await client.sendKeyEvent('4');

        // const nextPayment = await client.findElement('id', 'add-cash-next-btn');
        const nextPayment = await client.$('//android.view.ViewGroup[@content-desc="add-cash-next-btn"]/android.widget.TextView');
        await nextPayment.click();

        await new Promise(done => setTimeout(done, 5000));

        const paidBtn = await client.findElement('id', 'payment-already-paid');

        // The code below is waiting on the add cash fix

        // const paidBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup[2]/android.widget.TextView');
        // await paidBtn.click();

        // await new Promise(done => setTimeout(done, 3000));

        // const doneBtn = await client.findElement('id', 'paymnent-complete-done-btn');
        // // const doneBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.widget.TextView');
        // await doneBtn.click();

        // // todo use same user to login (as opposed to logging in via test defaults)
        // const login = await client.findElement('id', 'login-btn');
        // // const login = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        // await login.click();

        // await new Promise(done => setTimeout(done, 6000));

        // const requiresOTP = await client.findElement('id', 'otp-index-1').isDisplayed();
        // // const otpPath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.EditText';
        // // const requiresOTP = await client.$(otpPath).isDisplayed();

        // if (requiresOTP) {
        //     [1, 2, 3, 4].forEach(async (index) => {
        //         const otpField = await client.findElement('id', `otp-index-${index}`);
        //         await updateField(otpField, 1);
        //     });

        //     const continueButton4 = await client.findElement('id', 'otp-continue-btn');
        //     // const continueButton4 = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[5]/android.widget.TextView');
        //     await continueButton4.click();
        // };

        // // handle boost page

        // await new Promise(done => setTimeout(done, 5000))

        // await client.sendKeyEvent('111');

        // await client.deleteSession();
    });

    it('Handles user registration where user uses randomly generated password', async () => {
        const client = await wdio.remote(opts);

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';

        const field = await client.$(xpath);

        const visible = await field.isDisplayed();
        // assert(visible);

        const button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        // assert(await button.getText(), 'NEXT');
        button.click();
        
        // assert(await button.getText(), 'NEXT');
        button.click();

        // assert(await button.getText(), 'NEXT');
        button.click();

        // assert(await button.getText(), 'START SAVING');    
        button.click();
        
        const continueButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView');
        // assert(await continueButton.getText(), 'CONTINUE');
        continueButton.click();

        await new Promise(done => setTimeout(done, 5000));

        const emailField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.widget.EditText');
        emailField.click();
        await updateField(emailField, `testemail${random(100, 1000)}@test.tst`);

        const idField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText');
        idField.click();
        await updateField(idField, random(1000000000000, 10000000000000).toString());
        
        const contButton = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView');
        // assert(await contButton.getText(), 'CONTINUE');
        contButton.click();

        await new Promise(done => setTimeout(done, 2000));

        const generatePwdBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView[2]');
        console.log('found text:', await generatePwdBtn.getText());
        generatePwdBtn.click();

        await new Promise(done => setTimeout(done, 2000));

        await client.deleteSession();
    });

    it('Handles user login properly', async() => {
        const client = await wdio.remote(opts);

        await client.pause(6000);
        const xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup';
        const field = await client.$(xpath);
        const visible = await field.isDisplayed();
        // assert(visible);
        const text = await field.getText();
        const button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView');
        // assert(await button.getText(), 'NEXT');
        button.click();
        // assert(await button.getText(), 'NEXT');
        button.click();
        // assert(await button.getText(), 'NEXT');
        button.click();
        // assert(await button.getText(), 'START SAVING');    
        button.click();
        const login = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[4]');

        console.log('login text: ', await login.getText());
    });

});
