# aeternity-playground
[Aeternity](https://aeternity.com/) blockchain playground


## network
This works best with a local docker-based network, created with the aeproject tool.

- [aeproject - github](https://github.com/aeternity/aepp-aeproject-js)
- [aeproject - documentation](https://aeproject.gitbook.io/aeproject/)

It's possible to select the test network but the transfer-/contract-functionality doesn't work there.

## client/ts

TypeScript/React client with rudimentary [aeapp-sdk-js](https://github.com/aeternity/aepp-sdk-js) TypeScript definitions.

### Build

See [build-instructions](./client/ts/README.md).
### Functionality
- Select network
- Transfer funds between Alice and Bob
- Call contract

#### Dashboard
**Note:** If Alice or Bob wallets shows up as "Account not found" on localhost, just transfer funds between them to add the accounts.

![dashboard-1.png](./images/dashboard-1.png)

#### Transfer between Alice and Bob
![dashboard-1.png](./images/transfer-alice-bob-1.png)

#### Call contract
![foo](./images/contract-1-1.gif)


