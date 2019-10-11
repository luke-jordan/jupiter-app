module.exports = {
    'parser': 'babel-eslint',
    'env': {
        'browser': true,
        'react-native/react-native': true
    },
    'plugins': [
        'react',
	    'react-native'
    ],
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'rules': {
        'react-native/no-unused-styles': 'error',
        'react-native/split-platform-components': 'error',
        'react-native/no-inline-styles': 'error',
        'react-native/no-color-literals': 'error',
        'react-native/no-raw-text': 'warn',
        'react/prop-types': 'off'
    }
}
