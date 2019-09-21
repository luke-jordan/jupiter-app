import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

export const ValidationUtil = {

    isValidEmailPhone (text) {
        const isInputEmail = isEmail(text);
        if (isInputEmail) {
            return true;
        }

        const isInputPhone = isMobilePhone(text);
        if (isInputPhone) {
            return true;
        }

        return false;
    }
    
};