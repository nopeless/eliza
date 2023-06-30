# Eliza bot

Originally monkey patched js bot, but now is more powerful

## Installation & dev environment

```sh
npm i -g yarn
yarn install --immutable
```

To run the bot in the console

```sh
yarn cli
```

To run tests

```sh
yarn test
```

To lint

```sh
yarn lint
```

To run the bot

```sh
yarn dev

# or
yarn build
yarn start 
```

## Handler rules

handlers are applied sequentially

If the message is replied, no other handlers will be executed

If the handler returns a string, it is a "deferred reply"

If no handler replies to the message and a deferred reply exists, it is used as the reply

The sole exception is `help`

If there are only two deferred replies and one of them is the `help` deferred reply, the non-help will be used as the reply
