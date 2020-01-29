import { UPDATE_AUTH_TOKEN, REMOVE_AUTH_TOKEN } from './auth.actions';

const initialState = { };

export const STATE_KEY = 'auth';

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_AUTH_TOKEN: {
            return {
                ...state,
                token: action.token,
            };
        }
        case REMOVE_AUTH_TOKEN: {
            const newState = { ...state };
            Reflect.deleteProperty(newState, 'token');
            return newState;
        }
        default: {
            return state;
        }
    }
};

export const getAuthToken = state => state[STATE_KEY].token;

export default authReducer;
