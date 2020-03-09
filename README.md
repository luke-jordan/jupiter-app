# Jupiter App

React Native mobile app for Jupiter

## Get Started

Use next commands to run project in development mode.

```sh
$ yarn
$ yarn start
```

Install [Expo client](https://expo.io/tools) on your mobile device or use simulator for testing.

## Linting

We use ESLint, Stylelint and Commitlint.
Run next command to validate linter checks:

```sh
$ yarn lint
```

Apply Prettier formatting:

```sh
$ yarn prettier
```

## State

Domains:

* transaction: for managing flow from start of save / withdrawal to completion. Only for managing currently-in-process transaction. Prior or pending transactions, when not currently in active flow, are part of the history domain.