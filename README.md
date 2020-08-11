# aeternity-playground
[Aeternity](https://aeternity.com/) blockchain JavaScript API playground.

Written in TypeScript with [React](https://reactjs.org/) and [material-ui](https://material-ui.com/).


TypeScript definitions are in [client/ts/src/aeternity-aepp-sdk.d.ts](client/ts/src/aeternity-aepp-sdk.d.ts). <br>NOTE: The TypeScript definitions are not complete, updated on a "need to use" basis.


## Functionality
- Select network
- Transfer funds between Alice and Bob
- Call contract
- State channel, send messages.
- State channel, call contract

## Example

![example-1.gif](./images/example-1.gif)

## Quick start

You need Node.js, docker-compose and a web-browser.

In three separate terminals.

**1. Terminal 1** - Build web-client and start the web-server
```
$ make -C client/ts deps 
$ make -C client/ts watch-js
```

Ignore the webpack warnings.

If you already have a network up and running, you can add your own network configuration in [./client/ts/dist/runtime-config.json](./client/ts/dist/runtime-config.json) and skip the "Terminal 2" and "Terminal 3" steps.


**2. Terminal 2** - Run Aeternity network node
```
$ make -C dev-network start-network 
```

Ignore the "node2" and "node3" resolve warnings.

**3. Terminal 3** - Run Aeternity compiler
```
$ make -C dev-network start-compiler
```

**4. Browser**

```http://localhost:9000```

You will get "Alice"/"Bob" "Account not found" warnings in the log window until you have transferred funds to the these accounts.

Transfer funds between "Alice" and "Bob" at [http://localhost:9000/views/transfer-alice-bob.html](http://localhost:9000/views/transfer-alice-bob.html), to get rid of the warnings.



## Network

I'm using a docker node setup, see [./dev-network/README.md](./dev-network/README.md)

It's possible to select the test network but the transfer-/contract-functionality doesn't work there.

### aeproject
Originally I used a local docker-based network, created with the aeproject tool.

- [aeproject - github](https://github.com/aeternity/aepp-aeproject-js)
- [aeproject - documentation](https://aeproject.gitbook.io/aeproject/)


## client/ts

TypeScript/React client with rudimentary [aeapp-sdk-js](https://github.com/aeternity/aepp-sdk-js) TypeScript definitions.

### Build

See [build-instructions](./client/ts/README.md).

### Network configuration

You can add your own network configurations in [client/ts/dist/runtime-config.json](client/ts/dist/runtime-config.json)







