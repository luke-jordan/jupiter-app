import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

const VALID_ID = /^(\d{13})$/;

export const ValidationUtil = {

    isValidEmailPhone (text) {
        const isInputEmail = isEmail(text);
        if (isInputEmail) {
            return true;
        }

        // note: validator library passes things that look like phone numbers but are too short, hence the length check
        const isInputPhone = isMobilePhone(text);
        if (isInputPhone && text.length >= 10) {
            return true;
        }

        return false;
    },
    
    isValidId (text) {
        return VALID_ID.test(text);
    }

};