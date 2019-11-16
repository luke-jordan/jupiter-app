const assert = require('assert');
const config = require('config');
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
                client.sendKeyEvent('67');  // deletes default text, char by char
            });
        };

        await field.sendKeys([updateValue]);
        await client.sendKeyEvent('23');
    };

    it('Handles user registration, initial deposit, and subsequent login', async () => {
        await client.pause(6000);

        const field = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup'
        );
        const visible = await field.isDisplayed();
        assert(visible);

        let button = await client.$('//android.view.ViewGroup[@content-desc="onboarding-button"]/android.widget.TextView');
        if (!button || button.error) {
            button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView'
            );
        };
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'NEXT');
        button.click();
        assert(await button.getText(), 'START SAVING');    
        button.click();
    });
        
    it('Handles limited users page', async () => {
        let button = await client.$('//android.view.ViewGroup[@content-desc="limited-users-button"]/android.widget.TextView');
        if (!button || button.error) {
            button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup[2]/android.widget.TextView'
            );
        };
        assert(await button.getText(), 'CONTINUE');
        button.click();

        await new Promise(done => setTimeout(done, 5000));

    });

    it('Fills in registration with unique national id and email', async () => {
        let emailField = await client.$(testUtil.assembleXPath('EditText', 'register-email-or-phone'));
        if (!emailField || emailField.error) {
            emailField = await client.$('/hierarchy/android.widget.FrameLayout/' + 
                'android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/' + 
                'android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/' + 
                'android.widget.EditText'
            );
        }
        await emailField.click();
        await updateField(emailField, `testemail${Math.trunc(random(1000, 100000))}@test.tst`);

        let idField = await client.$(testUtil.assembleXPath('EditText', 'register-id-number'));
        if (!idField || idField.error) {
            idField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/' + 
                'android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText'
            );
        }
        idField.click();
        await updateField(idField, Math.trunc(random(1000000000000, 10000000000000)).toString());
        
        await client.sendKeyEvent('4');

        let button = await client.$('//android.view.ViewGroup[@content-desc="register-continue-btn"]');
        if (!button || button.error) {
            button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.TextView'
            );
        }
        assert(await button.getText(), 'CONTINUE');
        button.click();

        await new Promise(done => setTimeout(done, 2000));
    });


    it('Fills in a policy conforming password', async () => {
        const testPassword = testUtil.generatePassword();

        let confirmPwdField = await client.$(testUtil.assembleXPath('EditText', 'set-password-input-2'));
        if (!confirmPwdField || confirmPwdField.error) {
            confirmPwdField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/' + 
                'android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText'
            );
        }
        confirmPwdField.click();
        await updateField(confirmPwdField, testPassword);

        await client.sendKeyEvent('4');        

        let passwordField = await client.$(testUtil.assembleXPath('EditText', 'set-password-input-1'));
        if (!passwordField || passwordField.error) {
            passwordField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/' + 
                'android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/' + 
                'android.view.ViewGroup/android.widget.EditText'
            );
        }
        passwordField.click();
        await updateField(passwordField, testPassword);

        await client.sendKeyEvent('4');

        let button = await client.$('//android.view.ViewGroup[@content-desc="set-password-continue-btn"]/android.view.View');
        if (!button || button.error) {
            button = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/' + 
                'android.widget.TextView'
            );
        };
        button.click();

        await new Promise(done => setTimeout(done, 6000));
    });

    it('Enters an amount to deposit', async () => {
        let amountField = await client.$(testUtil.assembleXPath('EditText', 'add-cash-input'));
        if (!amountField || amountField.error) {
            amountField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.EditText'
            );
        }
        amountField.click();
        await updateField(amountField, random(100, 10000).toFixed(2).toString());

        await client.sendKeyEvent('4');

        let nextPayment = await client.$('//android.view.ViewGroup[@content-desc="add-cash-next-btn"]/android.view.View');
        if (!nextPayment || nextPayment.error) {
            nextPayment = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup[2]/android.widget.TextView'
            );
        }
        await nextPayment.click();

        await new Promise(done => setTimeout(done, 5000));

    });

    it('Handles payment page', async () => {
        let paidBtn = await client.$('//android.view.ViewGroup[@content-desc="payment-already-paid"]/android.widget.TextView');
        if (!paidBtn || paidBtn.error) {
            paidBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/' + 
                'android.view.ViewGroup[2]/android.widget.TextView'
            );
        }
        await paidBtn.click();

        await new Promise(done => setTimeout(done, 4000));

        const doneBtn = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup[4]/android.widget.TextView'
        );
        await doneBtn.click();
    });

    it('Handles subsequent login page, if presented', async () => {
        const login = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.View'
        );

        if (login && !login.error) {
            await login.click();
        }

        await new Promise(done => setTimeout(done, 6000));

        const requiresOTP = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/' + 
            'android.view.ViewGroup/android.widget.EditText'
        );

        if (requiresOTP && !requiresOTP.error) {
            [1, 2, 3, 4].forEach(async (index) => {
                const otpField = await client.$('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
                    'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                    'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
                    `android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[${index}]/` + 
                    'android.view.ViewGroup/android.widget.EditText'
                );
                await updateField(otpField, 1);
            });

            const continueButton4 = await client.$('/hierarchy/android.widget.FrameLayout/' + 
                'android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
                'android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/' + 
                'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
                'android.view.ViewGroup[5]/android.widget.TextView'
            );
            await continueButton4.click();
        };

        await new Promise(done => setTimeout(done, 5000));

        await client.sendKeyEvent('111');

        await client.deleteSession();
    });

});

