/**
 * aeapp-sdk-js npm package TypeScript definitions
 * 
 * Based on  @aeternity/aepp-sdk@7.6.0
 * NOTE: These definitions are far from complete
 * 
 */


// -----------------------------------------------------------------------------
// es/utils

declare module '@aeternity/aepp-sdk/es/utils/async-init' {
    /**
     * FIXME: Type definition
     */
    export interface AsyncInit {
    }
}


declare module '@aeternity/aepp-sdk/es/utils/crypto' {

    export type KeyPair = {
        publicKey : string
        secretKey : string
    }

    /**
     * Generate a random ED25519 keypair
     * @param raw - Whether to return raw (binary) keys (default false)
     */
    export function generateKeyPair(raw? : boolean /*= false*/) : KeyPair
}



// -----------------------------------------------------------------------------
// es/account

/**
 * See es/account/index.js
 */
declare module '@aeternity/aepp-sdk/es/account' {
    /**
     * methods: ['sign', 'address', 'signTransaction', 'getNetworkId', 'signMessage', 'verifyMessage']
     * Required are sign and address
     */
    export interface Account {

        /**
         * Sign data blob
         * @param data Data blob to sign
         * @returns Signed data blob
         */
        sign(data : string) : Promise<string>

        /**
         * Obtain account address
         * @returns Public account address
         */
        address() : Promise<string>



        /**
         * Sign encoded transaction
         * @param tx Transaction to sign
         * @param opt Options
         * @returns Signed transaction
        */
        signTransaction(tx : any, opt? : {} /*= {} */) : Promise<string>
    }
}

/**
 * See es/account/selector.js
 */
declare module '@aeternity/aepp-sdk/es/account/selector' {

    import {Account} from '@aeternity/aepp-sdk/es/account'

    /**
     * FIXME: methods: { sign, address, selectAccount, resolveOnAccount },
     */
    export interface Selector extends Account {
        // sign and address from Account
    }
}


/**
 * See es/account/memory.js
 */
declare module '@aeternity/aepp-sdk/es/account/memory' {

    import {Account} from '@aeternity/aepp-sdk/es/account'

    /**
     * 
     * FIXME: methods: { sign, address, setSecret },
     */
    export interface MemoryAccount extends Account {
        // sign and address from Account
    }

    type KeyPair = {
        /** Public key */
        publicKey : string
        /** Private key */
        secretKey : string
    }

    /**
     * In-memory `Account` factory
     * @param options 
     */
    export function MemoryAccountF(options : {
        keypair? : KeyPair

        /** Generalize Account public key */
        gaId?    : string
    }) : MemoryAccount


    export default MemoryAccountF
}


/**
 * See es/accounts.js
 */
declare module '@aeternity/aepp-sdk/accounts' {

    import {AsyncInit} from "@aeternity/aepp-sdk/es/utils/async-init"

    import {Selector} from "@aeternity/aepp-sdk/es/account/selector"

    /**
     * FIXME : methods: { signWith, addAccount, removeAccount, addresses }
     */
    export interface Accounts extends AsyncInit, Selector {

        /**
         * Get accounts addresses
         */
        addresses() : string[]
    }


    // const Accounts = stampit(AsyncInit, {
    export function AccountsF(args : {
        accounts : any[]
    }) : Accounts

    export default AccountsF;
    
}

// -----------------------------------------------------------------------------
// 

/**
 * See es/contract/index.js
 */
declare module '@aeternity/aepp-sdk/contract' {
    type ContractGetACIResult = {
        source : string
        options : any[]
    }

    type Filesystem = any
    type Backend = 'aevm'

    interface ContractBase {

        /**
         * Encode contract data
         * @rtype (source: String, name: String, args: Array, options: Array) => callData: Promise[String]
         * @param {String} source - Contract source code
         * @param {String} name - Function name
         * @param {Array} args - Function argument's
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {String} - Contract encoded data
         */
        contractEncodeCallDataAPI(source : string, name : string, args : any[], options? : {
            filesystem? : Filesystem,
            backend?    : Backend
        }) : Promise<string>


        /**
         * Get contract ACI
         * @function contractGetACI
         * @instance
         * @abstract
         * @category async
         * @rtype (source: String, options: Array) => aciObject: Promise[Object]
         * @param {String} source - Contract source code
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {Object} - Contract aci object
         */
        contractGetACI(source : string, options?: {
             filesystem? : Filesystem
             backend? : Backend
         }) : Promise<ContractGetACIResult>

         // FIXME: More functions in ContractBase


        /**
         * FIXME: Got CORS error
         * Decode contract call result data
         * @rtype (source: String, fn: String, callValue: String, callResult: String, options: Array) => decodedResult: Promise[String]
         * @param {String} source - Contract source
         * @param {String} fn - Fn name
         * @param {String} callValue - result data (cb_das...)
         * @param {String} callResult - contract call result status('ok', 'revert', ...)
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {String} - Decoded contract call result
         */
        contractDecodeCallResultAPI(source : string, fn : string, callValue : string, callResult, options? : {
            filesystem? : Filesystem
            backend?    : Backend
        }) : Promise<any>



        /**
         * Decode data
         * @function contractDecodeDataAPI
         * @instance
         * @abstract
         * @category async
         * @rtype (type: String, data: String) => decodedResult: Promise[String]
         * @param {String} type - Contract call result type
         * @param {String} data - Encoded contract call result
         * @return {String} - Decoded contract call result
         */
        contractDecodeDataAPI(type : string, data: string) : Promise<string>

        /**
         * Decode contract call result data
         * @function contractDecodeCallResultAPI
         * @instance
         * @abstract
         * @category async
         * @rtype (source: String, fn: String, callValue: String, callResult: String, options: Array) => decodedResult: Promise[String]
         * @param {String} source - Contract source
         * @param {String} fn - Fn name
         * @param {String} callValue - result data (cb_das...)
         * @param {String} callResult - contract call result status('ok', 'revert', ...)
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {String} - Decoded contract call result
         */

        /**
         * Decode call data by source
         * @function contractDecodeCallDataBySourceAPI
         * @instance
         * @abstract
         * @category async
         * @rtype (source: String, function: String, callData: String, options: Array) => decodedResult: Promise[String]
         * @param {String} source - contract source
         * @param {String} function - function name
         * @param {String} callData - Encoded contract call data
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {String} - Decoded contract call data
         */

        /**
         * Decode call data by bytecode
         * @function contractDecodeCallDataByCodeAPI
         * @instance
         * @abstract
         * @category async
         * @rtype (code: String, callData: String) => decodedResult: Promise[String]
         * @param {String} code - contract byte code
         * @param {String} callData - Encoded contract call data
         * @param {String} backend - Contract vm(default: aevm)
         * @return {String} - Decoded contract call data
         */

        /**
         * Compile contract
         * @function compileContractAPI
         * @instance
         * @abstract
         * @category async
         * @rtype (code: String, options?: Object) => compiledContract: Object
         * @param {String} code - Contract source code
         * @param {Object} [options={}]  Options
         * @param {Object} [options.filesystem]  Contract external namespaces map
         * @param {Object} [options.backend]  Contract vm(default: aevm)
         * @return {Object} Object which contain bytecode of contract
         */
        compileContractAPI(code : string, options? : {
            filesystem? : any
            backend ?: Backend
        }) : Promise<string>

        /**
         * Set compiler url
         * @function setCompilerUrl
         * @instance
         * @abstract
         * @category async
         * @rtype (url: String) => void
         * @param {String} url - Compiler url
         * @return {void}
         */
        setCompilerUrl(url : string) : void

        /**
         * Get Compiler Version
         * @function getCompilerVersion
         * @instance
         * @abstract
         * @category async
         * @rtype () => String
         * @return {String} Compiler version
         */
         getCompilerVersion() : Promise<string>
    }

    export default ContractBase
}

/**
 * See es/contract/aci/index.js
 */

declare module '@aeternity/aepp-sdk/contract/aci' {
    
    export class ContractACI {

        /**
         * Generate contract ACI object with predefined js methods for contract usage - can be used for creating a reference to already deployed contracts
         * @alias module:@aeternity/aepp-sdk/es/contract/aci
         * @param {String} source Contract source code
         * @param {Object} [options={}] Options object
         * @param {String} [options.aci] Contract ACI
         * @param {String} [options.contractAddress] Contract address
         * @param {Object} [options.filesystem] Contact source external namespaces map
         * @param {Object} [options.forceCodeCheck=true] Don't check contract code
         * @param {Object} [options.opt] Contract options
         * @return {ContractInstance} JS Contract API
         * @example
         * ```
         * const contractIns = await client.getContractInstance(sourceCode)
         * await contractIns.deploy([321]) or await contractIns.methods.init(321)
         * const callResult = await contractIns.call('setState', [123]) or await contractIns.methods.setState.send(123, options)
         * const staticCallResult = await contractIns.call('setState', [123], { callStatic: true }) or await contractIns.methods.setState.get(123, options)
         * ```
         * Also you can call contract like: await contractIns.methods.setState(123, options)
         * Then sdk decide to make on-chain or static call(dry-run API) transaction based on function is stateful or not
         */
        getContractInstance(source : string, args : {
            aci : string
            contractAddress : string
            fileSystem : any
            forceCodeCheck? : boolean
            opt : any
        }) : any 

    }

    export default ContractACI
}

/**
 * See es/contract/compiler.js
 */
declare module '@aeternity/aepp-sdk/contract/compiler' {
    import ContractBase from '@aeternity/aepp-sdk/contract'

    interface ContractCompilerAPI extends ContractBase {

    } 

    export default ContractCompilerAPI
}


/**
 * See es/ae/contract.js
 * FIXME: A lot of stuff missing from declaration
 */
declare module '@aeternity/aepp-sdk/ae/contract' {
    import NodePool from '@aeternity/aepp-sdk/es/node-pool'

    import ContractBase from '@aeternity/aepp-sdk/contract'
    import ContractACI from '@aeternity/aepp-sdk/contract/aci'
    import ContractCompilerAPI from '@aeternity/aepp-sdk/contract/compiler'

  
    export type ContractCompileResult = {
        bytecode : string 
        //  deploy: async (init, options = {}) => this.contractDeploy(bytecode, source, init, R.merge(opt, options)),
        deploy : (init : string | any[], options? : {filesystem? : ContractExternalNamespaceMap}) => Promise<ContractDeployReturnValue>

        //  deployStatic: async (init, options = {}) => this.contractCallStatic(source, null, 'init', init, {
        deployStatic : (init : string | any[], options? : {filesystem? : ContractExternalNamespaceMap}) => Promise<ContractCallStaticResult>

        // encodeCall: async (name, args) => this.contractEncodeCall(source, name, args, R.merge(opt, options)),
        encodeCall : (name : string, args : any[]) => Promise<string>
    }

    type ContractCallReturnValue = {
        hash : string
        result : ContractCallResult
        decode : () => Promise<string>
    }

    // FIXME: Same as ContractDeployResult?
    type ContractCallResult = {
        callerId : string
        callerNonce : number
        contractId : string
        gasPrice :  number
        gasUsed : number
        height : number
        log : any[],
        returnType : 'ok' | string
        returnValue : string
    }

    type ContractExternalNamespaceMap = any
    type CompilerBackend = 'aevm' | 'fate'

    /** Argument's array or callData for call function */
    type ArgsOrCallData = string | any[]

    /**
     * Encode call data for contract call
     * @param source Contract source code
     * @param name Name of function to call
     * @param args Argument's for call
     */
    // async function contractEncodeCall (source, name, args, options) {     
    type ContractEncodeCallF = (source : string, name : string, args : any[], options? : {
        /** Contract external namespaces map */
        filesystem? : ContractExternalNamespaceMap
        /** Compiler backend */
        backend? : CompilerBackend
    }) => Promise<string>


    /**
     * Deploy contract to the node
     * @param code Compiled contract
     * @param source Contract source code
     * @param initState Arguments of contract constructor(init) function. Can be array of arguments or callData string
     * @example
     * ```js
     * const deployed = await client.contractDeploy(bytecode, source, init = [], options)
     * {
     *   owner: OWNER_PUB_KEY,
     *   transaction: TX_HASH,
     *   address: CONTRACT_ADDRESS,
     *   createdAt: Date,
     *   result: DEPLOY_TX_DATA,
     *   call: (fnName, args = [], options) => Call contract function,
     *   callStatic: (fnName, args = [], options) => Static all contract function
     * }
     * ```
     */
    // async function contractDeploy (code, source, initState = [], options = {}) {
    type ContractDeployF = (code : string, source : string, initState? : ArgsOrCallData, options? : {
        /** Contract external namespaces map */
        filesystem? : ContractExternalNamespaceMap
    }) =>  Promise<ContractDeployReturnValue>

    type ContractDeployReturnValue = {
        owner : string
        transaction : string
        address : string
        createdAt : Date
        result : ContractDeployResult

        //  call: async (name, args = [], options = {}) => this.contractCall(source, contractId, name, args, R.merge(opt, options)),
        call : (fnName : string, args? : ArgsOrCallData, options? : {filesystem? : ContractExternalNamespaceMap}) => Promise<ContractCallReturnValue>

        // callStatic: async (name, args = [], options = {}) => this.contractCallStatic(source, contractId, name, args, {
        callStatic : (fnName : string, args? : ArgsOrCallData, options? : any) => Promise<ContractCallStaticResult>
    }

    type ContractDeployResult = {
        callerId : string
        callerNonce : number
        contractId : string
        gasPrice : number
        gasUsed : number
        height : number
        log : any[]
        returnType : 'ok' | any
        returnValue : string
    }



    /**
     * Static contract call(using dry-run)
     * @function
     * @alias module:@aeternity/aepp-sdk/es/ae/contract
     * @category async
     * @param {String} source Contract source code
     * @param {String} address Contract address
     * @param {String} name Name of function to call
     * @param {Array|String} args Argument's or callData for call/deploy transaction
     * @param {Object} [options={}]  Options
     * @param {String} [options.top] Block hash on which you want to call contract
     * @param {String} [options.bytecode] Block hash on which you want to call contract
     * @param {Object} [options.options]  Transaction options (fee, ttl, gas, amount, deposit)
     * @param {Object} [options.options.filesystem] Contract external namespaces map
     * @return {Promise<Object>} Result object
     * @example
     * const callResult = await client.contractCallStatic(source, address, fnName, args = [], { top, options = {} })
     * {
     *   result: TX_DATA,
     *   decode: (type) => Decode call result
     * }
     */
    // async function contractCallStatic (source, address, name, args = [], { top, options = {}, bytecode } = {}) {
    type ContractCallStaticF = (source : string, address : address, name : string, args? : ArgsOrCallData , options : {

        /**  Block hash on which you want to call contract */
        top? : string

        bytecode? : string,

        options? : {
            /** Contract external namespaces map */
            filesystem? : ContractExternalNamespaceMap           
        }

    }) => Promise<ContractCallStaticResult>

    type ContractCallStaticResult = {
        result: any
        decode : (type : any) => any
    }

    interface ContractAPI extends ContractBase, ContractACI { 
        /**
         * Compile contract source code
         * @function
         * @alias module:@aeternity/aepp-sdk/es/ae/contract
         * @category async
         * @param {String} source Contract sourece code
         * @param {Object} [options={}] Transaction options (fee, ttl, gas, amount, deposit)
         * @param {Object} [options.filesystem={}] Contract external namespaces map* @return {Promise<Object>} Result object
         * @param {Object} [options.backend='aevm'] Contract backend version (aevm|fate)
         * @return {Promise<Object>} Result object
         * @example
         * ```
         * const compiled = await client.contractCompile(SOURCE_CODE)
         * {
         *   bytecode: CONTRACT_BYTE_CODE,
         *   deploy: (init = [], options = {}) => Deploy Contract,
         *   encodeCall: (fnName, args = []) => Prepare callData
         * }
         * ```
         */
        contractCompile(source : string, options? : {
            filesystem? : ContractExternalNamespaceMap
            backend? : CompilerBackend
        }) : Promise<ContractCompileResult>


        contractEncodeCall : ContractEncodeCallF 
        contractDeploy : ContractDeployF


        /**
         * Call contract function
         * 
         * @param {String} source Contract source code
         * @param {String} address Contract address or AENS name
         * @param {String} name Name of function to call
         * @param {Array|String} argsOrCallData Argument's array or callData for call function
         * @example
         * ```js
         * const callResult = await client.contractCall(source, address, fnName, args = [], options)
         * {
         *   hash: TX_HASH,
         *   result: TX_DATA,
         *   decode: (type) => Decode call result
         * }
         * ```
         */
        // async function contractCall (source, address, name, argsOrCallData = [], options = {}) {
        contractCall(source : string, address : string, name : string, argsOrCallData : ArgsOrCallData, options? : {
            /** Contract external namespaces map */
            filesystem? : ContractExternalNamespaceMap
        }) : Promise<ContractCallReturnValue>

        /**
         * Decode contract call result data
         * @param source - source code
         * @param fn - function name
         * @param callValue - result call data
         * @param callResult - result status
         * @example
         * 
         * ```js
         * const decodedData = await client.contractDecodeData(SourceCode ,'functionName', 'cb_asdasdasd...', 'ok|revert')lt
         * ```
         */
        //async function contractDecodeData (source, fn, callValue, callResult, options) {
        contractDecodeData(source : string, fn : string, callValue : string, callResult : 'ok' | string, options? : {
            /** Contract external namespaces map */
            filesystem? : ContractExternalNamespaceMap
            backend? : CompilerBackend        
        }) : Promise<
            string 
            | 
            {
                error : string[]
            }
        >

        contractCallStatic : ContractCallStaticF
    }

    export interface Contract extends ContractAPI, NodePool {
    }

    export interface ContractWithCompiler extends Contract, ContractCompilerApi {
    }

    export default ContractWithCompiler
}

// -----------------------------------------------------------------------------
// es/node-pool

/**
 * See es/node-pool/index.js
 */
declare module '@aeternity/aepp-sdk/es/node-pool' {

    import {Node} from '@aeternity/aepp-sdk/es/node'

    /**
     * Node Pool Stamp
     * This stamp allow you to make basic manipulation(add, remove, select) on list of nodes
     */
    export interface NodePool {

        /**
         * Add Node
         * @param name Node name
         * @param nodeInstance Node instance
         * @param select Select this node as current (default false)
         */
        addNode(name : string, nodeInstance : Node, select? : boolean /*= false */) : void

        /**
         * Get information about node
         * @example
         * ```
         * nodePool.getNodeInfo() // { name, version, networkId, protocol, ... }
         * ```
         */
        getNodeInfo() : {
            version : string
            name    : string
            nodeNetworkId : string
            url           : string
            internalUrl   : string
            consensudProtocolVersion : string
        }
    }

    export default NodePool
}

/**
 * See es/node.js
 */
declare module "@aeternity/aepp-sdk/es/node" {

    export class Node {
        version : string
        revision : string

        url : string
        internalUrl : string
        nodeNetworkId : string
        methods : string[]
        api : any // Object with functions
    

        Swagger : any
    }

    /**
     * 
     */
    export type AxiosConfig = {
        /**
         * See https://github.com/axios/axios#request-config
         */
        config : any

        errorHandler : (err : any) => void
    }

    /**
     * @param args 
     */
    export function NodeF(args : {
        url : string
        internalUrl? : string
        axiosConfig? : AxiosConfig
    }) : Promise<Node>

    

    export default NodeF;
}

// -----------------------------------------------------------------------------
// es/oracle


/**
 * See es/oracle/index.js
 */
declare module "@aeternity/aepp-sdk/es/oracle" {

    export type Oracle = any

    export interface OracleBase {
        /**
         * Get oracle by oracle public key
         * @param oracleId Oracle public key
         */
        getOracle(oracleId : string) : Promise<Oracle>

        /**
         * Get oracle queries
         * @param oracleId Oracle public key
         */
        getOracleQueries(oracleId : string) : Promise<any>

        /**
         * Get oracle query
         * @param oracleId Oracle public key
         * @param queryId Query id
         */
        getOracleQuery(oracleId : string, queryId : string) : Promise<any> 
    }

    export default OracleBase
}

declare module '@aeternity/aepp-sdk/es/oracle/node' {

    import {OracleBase} from '@aeternity/aepp-sdk/es/oracle'

    /**
     * OracleNodeAPI module
     *
     * This is the complement to {@link module:@aeternity/aepp-sdk/es/oracle}.
     */
    interface OracleNodeApi extends OracleBase {

    }

    export default OracleNodeApi
}

// -----------------------------------------------------------------------------
// es/chain

/**
 * See es/chain/index.js
 */
declare module '@aeternity/aepp-sdk/es/chain' {

    /**
     * Optional Chain.balance(...) parameters
     */
    type BalanceOptions = {
        /**
         * The chain height at which to obtain the balance for (default: top of chain)
         */
        height : number

        /**
         * The block hash on which to obtain the balance for (default: top of chain)
         */
        hash : string
    }


    /**
     * Chain.awaitHeight options
     */
    type AwaitHeightOptions = {
        /** Interval (in ms) at which to poll the chain */
        interval : number

        /** Number of polling attempts after which to fail */
        attempts : number
    }

    export interface Chain {

        /**
         * Wait for the chain to reach a specific height
         * 
         * @return Current chain height
         */

        awaitHeight(height : number, options? : AwaitHeightOptions) : Promise<number>

        /**
         * Request the balance of specified account
         * @param address The public account address to obtain the balance for
         * @param options Options
         * @returns The transaction as it was mined
         */
        balance(address : string, options? : BalanceOptions) : Promise<number | string>

        /**
         * Obtain current height of the chain
         */
        height() : Promise<number>
    }   
}

/**
 * See es/chain/node.js
 */
declare module '@aeternity/aepp-sdk/es/chain/node' {

    // import Chain from './'
    // import Oracle from '../oracle/node'
    // import TransactionValidator from '../tx/validator'
    // import NodePool from '../node-pool'
    // const ChainNode = Chain.compose(Oracle, TransactionValidator, NodePool, {

    import {Chain} from '@aeternity/aepp-sdk/es/chain'
    import Oracle from '@aeternity/aepp-sdk/es/oracle/node'
    import NodePool from '@aeternity/aepp-sdk/es/node-pool'

    /**
     * See es/chain/node.js
     * const ChainNode = Chain.compose(Oracle, TransactionValidator, NodePool, {
     */
    interface ChainNode extends Chain, Oracle, NodePool {

 
    }

    export default ChainNode
}


// -----------------------------------------------------------------------------
// es/channel

/**
 * See es/channel/index.js
 */
declare module '@aeternity/aepp-sdk/es/channel' {

    export type ChannelStatus = 'connecting' | 'connected' | 'disconnected'

    // See es/channel/internal.js
    export type OnInternalEvents = 'statusChanged' | 'stateChanged' | 'message' | 'error'

    export type OnEvents = 
        // Documented events
        'error' | 'onChainTx' | 'onWithdrawLocked' | 'withdrawLocked' | 'ownDepositLocked' | 'depositLocked' | 
        OnInternalEvents 
    
    // FIXME: I believe there are more status changes
    export type OnEventCbArg_StatusChanged = 
        'connected' | 'disconnected' | 'accepted' | 'halfSigned' | 'signed' |'open'

    export type OnEventCbArg_Message = {
        channel_id : string
        from       : string
        to         : string
        info       : string 
    }

    /** Channel */
    export interface Channel {

        /**
         * Close the connection
         */
        disconnect : () => void

        /**
         * Register event listener function
         *
         * Possible events:
         *
         *   - "error"
         *   - "onChainTx"
         *   - "ownWithdrawLocked"
         *   - "withdrawLocked"
         *   - "ownDepositLocked"
         *   - "depositLocked"
         *
         * @param event Event name
         * @param callback Callback function
         */
        on(event : OnEvents, callback : (args : any) => any) : any
        on(event : 'statusChanged', callback : (status : OnEventCbArg_StatusChanged) => void) : void
        on(event : 'message', callback : (msg : OnEventCbArg_Message) => void) : void
        on(event : 'onChainTx', callback : (tx : string) => void) : void
        on(event : 'stateChanged', callback : (tx : string) => void) : void

        /**
         * Send generic message
         *
         * If message is an object it will be serialized into JSON string
         * before sending.
         *
         * If there is ongoing update that has not yet been finished the message
         * will be sent after that update is finalized.
         *
         * @param {String|Object} message
         * @param {String} recipient - Address of the recipient
         * @example 
         * ```
         * channel.sendMessage(
         *   'hello world',
         *   'ak_Y1NRjHuoc3CGMYMvCmdHSBpJsMDR6Ra2t5zjhRcbtMeXXLpLH'
         * )
         * ```
         */
        sendMessage(message : string | object, recipient : string) : void
            
        /**
         * Get current status
         */
        status() : ChannelStatus

        /**
         * Get current state
         *
         * @return {Promise<Object>}
         */
        state() : Promise<object>

        /**
         * Get current round
         *
         * If round cannot be determined (for example when channel has not been opened)
         * it will return `null`.
         */
        round () : number | null

        /**
         * Get channel id
         */
        id() : string
        
        /**
         * Get channel's fsm id
         */
        fsmId() : string

        /**
         * Trigger a transfer update
         *
         * The transfer update is moving tokens from one channel account to another.
         * The update is a change to be applied on top of the latest state.
         *
         * Sender and receiver are the channel parties. Both the initiator and responder
         * can take those roles. Any public key outside of the channel is considered invalid.
         *
         * **Example**
         * ```
         * channel.update(
         *   'ak_Y1NRjHuoc3CGMYMvCmdHSBpJsMDR6Ra2t5zjhRcbtMeXXLpLH',
         *   'ak_V6an1xhec1xVaAhLuak7QoEbi6t7w5hEtYWp9bMKaJ19i6A9E',
         *   10,
         *   async (tx) => await account.signTransaction(tx)
         * ).then(({ accepted, signedTx }) =>
         *   if (accepted) {
         *     console.log('Update has been accepted')
         *   }
         * )       
         * ```
         * 
         * @param from Sender's public address
         * @param to Receiver's public address
         * @param amount Transaction amount
         * @param sign Function which verifies and signs offchain transaction
         * @param metadata
         */
        update(from : string, to : string, amount : number, sign : (tx : any) => any, metadata? : string[]) : Promise<any>


        /**
         * Trigger create contract update
         *
         * The create contract update is creating a contract inside the channel's internal state tree.
         * The update is a change to be applied on top of the latest state.
         *
         * That would create a contract with the poster being the owner of it. Poster commits initially
         * a deposit amount of tokens to the new contract.
         *
         * @example
         * ```
         * channel.createContract({
         *   code: 'cb_HKtpipK4aCgYb17wZ...',
         *   callData: 'cb_1111111111111111...',
         *   deposit: 10,
         *   vmVersion: 3,
         *   abiVersion: 1
         * }).then(({ accepted, signedTx, address }) => {
         *   if (accepted) {
         *     console.log('New contract has been created')
         *     console.log('Contract address:', address)
         *   } else {
         *     console.log('New contract has been rejected')
         *   }
         * })
         * ```
         */
        createContract(options : { 
            /** Api encoded compiled AEVM byte code */
            code : string, 
            /** Api encoded compiled AEVM call data for the code */
            callData : string, 
            /** Initial amount the owner of the contract commits to it */
            deposit : number, 
            /** Version of the AEVM */
            vmVersion : number, 
            /** Version of the ABI */
            abiVersion : number
        }, sign : (args : any) => void) : Promise<{
            accepted : boolean
            address  : string
            signedTx : string
        }>




        /**
         * Trigger call a contract update
         *
         * The call contract update is calling a preexisting contract inside the channel's
         * internal state tree. The update is a change to be applied on top of the latest state.
         *
         * That would call a contract with the poster being the caller of it. Poster commits
         * an amount of tokens to the contract.
         *
         * The call would also create a call object inside the channel state tree. It contains
         * the result of the contract call.
         *
         * It is worth mentioning that the gas is not consumed, because this is an off-chain
         * contract call. It would be consumed if it were a on-chain one. This could happen
         * if a call with a similar computation amount is to be forced on-chain.
         *
         * @param {Object} options
         * @param {Function} sign - Function which verifies and signs contract call transaction
         * @return {Promise<Object>}
         * @example 
         * 
         * ```
         * channel.callContract({
         *   contract: 'ct_9sRA9AVE4BYTAkh5RNfJYmwQe1NZ4MErasQLXZkFWG43TPBqa',
         *   callData: 'cb_1111111111111111...',
         *   amount: 0,
         *   abiVersion: 1
         * }).then(({ accepted, signedTx }) => {
         *   if (accepted) {
         *     console.log('Contract called succesfully')
         *   } else {
         *     console.log('Contract call has been rejected')
         *   }
         * })
         * ```
         */
        callContract(options : { 
            /** Amount the caller of the contract commits to it */
            amount   : string | number, 

            /** ABI encoded compiled AEVM call data for the code */
            callData   : string, 

            /** Address of the contract to call*/
            contract   : string, 

            /** Version of the ABI */
            abiVersion : number}, sign : (args : any) => any) : Promise<{
                accepted : boolean
                signedTx : string
            }>


        
        /**
         * Trigger a force progress contract call
         * This call is going on-chain
         * @param {Object} options
         * @param {String} [options.amount] - Amount the caller of the contract commits to it
         * @param {String} [options.callData] - ABI encoded compiled AEVM call data for the code
         * @param {Number} [options.contract] - Address of the contract to call
         * @param {Number} [options.abiVersion] - Version of the ABI
         * @param {Number} [options.gasPrice=1000000000] - Gas price
         * @param {Number} [options.gas=1000000] - Gas limit
         * @param {Function} sign - Function which verifies and signs contract force progress transaction
         * @param {{ onOnChainTxL: Function }} callbacks
         * @return {Promise<Object>}
         * @example channel.forceProgress({
         *   contract: 'ct_9sRA9AVE4BYTAkh5RNfJYmwQe1NZ4MErasQLXZkFWG43TPBqa',
         *   callData: 'cb_1111111111111111...',
         *   amount: 0,
         *   abiVersion: 1,
         *   gasPrice: 1000005554
         * }).then(({ accepted, signedTx }) => {
         *   if (accepted) {
         *     console.log('Contract force progress call successful')
         *   } else {
         *     console.log('Contract force progress call has been rejected')
         *   }
         * })
         */
        //function forceProgress ({ amount, callData, contract, abiVersion, gas = 1000000, gasPrice = 1000000000, nonce }, sign, { onOnChainTx } = {}) {
        
        /**
         * Call contract using dry-run
         *
         * In order to get the result of a potential contract call, one might need to
         * dry-run a contract call. It takes the exact same arguments as a call would
         * and returns the call object.
         *
         * The call is executed in the channel's state but it does not impact the state
         * whatsoever. It uses as an environment the latest channel's state and the current
         * top of the blockchain as seen by the node.
         *
         * @param {Object} options
         * @param {String} [options.amount] - Amount the caller of the contract commits to it
         * @param {String} [options.callData] - ABI encoded compiled AEVM call data for the code
         * @param {Number} [options.contract] - Address of the contract to call
         * @param {Number} [options.abiVersion] - Version of the ABI
         * @return {Promise<Object>}
         * @example channel.callContractStatic({
         *   contract: 'ct_9sRA9AVE4BYTAkh5RNfJYmwQe1NZ4MErasQLXZkFWG43TPBqa',
         *   callData: 'cb_1111111111111111...',
         *   amount: 0,
         *   abiVersion: 1
         * }).then(({ returnValue, gasUsed }) => {
         *   console.log('Returned value:', returnValue)
         *   console.log('Gas used:', gasUsed)
         * })
         */
        //async function callContractStatic ({ amount, callData, contract, abiVersion }) {

        /**
         * Get contract call result
         *
         * The combination of a caller, contract and a round of execution determines the
         * contract call. Providing an incorrect set of those results in an error response.
         *
         * @param {Object} options
         * @param {String} [options.caller] - Address of contract caller
         * @param {String} [options.contract] - Address of the contract
         * @param {Number} [options.round] - Round when contract was called
         * @return {Promise<Object>}
         * @example channel.getContractCall({
         *   caller: 'ak_Y1NRjHuoc3CGMYMvCmdHSBpJsMDR6Ra2t5zjhRcbtMeXXLpLH',
         *   contract: 'ct_9sRA9AVE4BYTAkh5RNfJYmwQe1NZ4MErasQLXZkFWG43TPBqa',
         *   round: 3
         * }).then(({ returnType, returnValue }) => {
         *   if (returnType === 'ok') console.log(returnValue)
         * })
         */
        //async function getContractCall ({ caller, contract, round }) {

        getContractCall(options : {
            /** Address of contract caller */
            caller, 
            /** Address of the contract */
            contract, 
            /** Round when contract was called*/
            round
        }) : Promise<{
            callerId : string
            callerNonce : number
            contractId : string
            gasPrice : number
            gasUsed  : number
            height   : number
            log      : any[]
            returnType : 'ok'
            returnValue : string
        }>

        /**
         * Get contract latest state
         *
         * @param {String} contract - Address of the contract
         * @return {Promise<Object>}
         * @example channel.getContractState(
         *   'ct_9sRA9AVE4BYTAkh5RNfJYmwQe1NZ4MErasQLXZkFWG43TPBqa'
         * ).then(({ contract }) => {
         *   console.log('deposit:', contract.deposit)
         * })
         */
        //async function getContractState (contract) {
        getContractState(contract : string) : Promise<any>

        /**
         * Leave channel
         *
         * It is possible to leave a channel and then later reestablish the channel
         * off-chain state and continue operation. When a leave method is called,
         * the channel fsm passes it on to the peer fsm, reports the current mutually
         * signed state and then terminates.
         *
         * The channel can be reestablished by instantiating another Channel instance
         * with two extra params: existingChannelId and offchainTx (returned from leave
         * method as channelId and signedTx respectively).
         *
         * @return {Promise<Object>}
         * @example 
         * ```
         * channel.leave().then(({ channelId, signedTx }) => {
         *   console.log(channelId)
         *   console.log(signedTx)
         * })
         * ``
         */
        //function leave () {
        leave : () => Promise<object>


        /**
         * Trigger mutual close
         *
         * At any moment after the channel is opened, a closing procedure can be triggered.
         * This can be done by either of the parties. The process is similar to the off-chain updates.
         *
         * @param {Function} sign - Function which verifies and signs mutual close transaction
         * @return {Promise<String>}
         * @example 
         * ```
         * channel.shutdown(
         *   async (tx) => await account.signTransaction(tx)
         * ).then(tx => console.log('on_chain_tx', tx))
         * ```
         */
        shutdown : (sign : (tx : any) => Promise<string>) => Promise<String>
    }


    export type SignTag = string

    /**
     * Channel params
     */
    export type ChannelOptions = {
        /**  Channel url (for example: "ws://localhost:3001")*/
        url : string

        /**  Participant role ("initiator" or "responder")*/
        role : 'initiator' | 'responder'

        /** Initiator's public key */
        initiatorId : string

        /** Responder's public key*/
        responderId : string

        /** Initial deposit in favour of the responder by the initiator*/
        pushAmount : number

        /** Amount of tokens the initiator has committed to the channel*/
        initiatorAmount : number

        /** Amount of tokens the responder has committed to the channel */
        responderAmount : number

        /** The minimum amount both peers need to maintain */
        channelReserve : number

        /** Minimum block height to include the channel_create_tx */
        ttl? : number

        /** Host of the responder's node  */
        host : string

        /** The port of the responders node */
        port : number

        /** Amount of blocks for disputing a solo close */
        lockPeriod : number

        /** Existing channel id (required if reestablishing a channel) */
        existingChannelId? : number

        /** Offchain transaction (required if reestablishing a channel) */
        offchainTx? : number

        /** The time waiting for a new event to be initiated (default: 600000) */
        timeoutIdle? : number

        /** The time waiting for the initiator to produce the create channel transaction after the noise session had been established (default: 120000) */
        timeoutFundingCreate? : number

        /** The time frame the other client has to sign an off-chain update after our client had initiated and signed it. This applies only for double signed on-chain intended updates: channel create transaction, deposit, withdrawal and etc. (default: 120000)*/
        timeoutFundingSign? : number

        /** The time frame the other client has to confirm an on-chain transaction reaching maturity (passing minimum depth) after the local node has detected this. This applies only for double signed on-chain intended updates: channel create transaction, deposit, withdrawal and etc. (default: 360000)*/
        timeoutFundingLock? : number

        /** The time frame the client has to return a signed off-chain update or to decline it. This applies for all off-chain updates (default: 500000) */
        timeoutSign? : number

        /** The time frame the other client has to react to an event. This applies for all off-chain updates that are not meant to land on-chain, as well as some special cases: opening a noise connection, mutual closing acknowledgement and reestablishing an existing channel (default: 120000) */
        timeoutAccept? : number

        /** the time frame the responder has to accept an incoming noise session. Applicable only for initiator (default: timeout_accept's value) */
        timeoutInitialized? : number

        /** The time frame the initiator has to start an outgoing noise session to the responder's node. Applicable only for responder (default: timeout_idle's value) */
        timeoutAwaitingOpen? : number

        /** Log websocket communication */
        debug? : boolean

        /** Function which verifies and signs transactions */
        sign : (tag : SignTag, tx : any) => Promise<string>
    }

    /**
     * Create Channel instance
     * @param options 
     */
    export function ChannelF(options : ChannelOptions) : Promise<Channel>

    export default ChannelF
}



// -----------------------------------------------------------------------------
// es/tx/builder

/**
 * See es/tx/builder/index.js
 */
declare module '@aeternity/aepp-sdk/es/tx/builder' {

    // FIXME: export default { calculateMinFee, calculateFee, unpackTx, unpackRawTx, buildTx, buildRawTx, validateParams, buildTxHash }

    /**
     * FIXME: Is this a public type?
     */
    export type _Tx = {
        VSN : '1'
        tag : '11' | string

        encodedTx : _EncodedTx
        signatures : any[]

        // FIXME: A lot more fields
        // Is this a public type?
    }

    export type _EncodedTx = {
        txType : UnpackTxType
        binary : any
        rlpEncoded : any
        tx : _EncodedTx_Tx
    }

    export type _EncodedTx_Tx = _EncodedTx_Tx_ChannelCreate 

    export type _EncodedTx_Tx_ChannelCreate = {
        VSN : "1",
        channelReserve : string
        delegateIds : string
        fee : string
        initiator : string
        initiatorAmount : string
        lockPeriod : string
        nonce : string
        responder : string
        responderAmount : string
        stateHash : string
        tag : string
        ttl : string
    }

    // FIXME: Add all txType
    export type UnpackTxType = 'channelCreate' | 'signedTx'
    export type UnpackTxResult = {
        txType : UnpackTxType
        rlpEncoded : Uint8Array
        binary : any,
        tx : _Tx
    }
    
    /**
     * Unpack transaction hash
     * 
     * @param encodedTx String or RLP encoded transaction array (if fromRlpBinary flag is true)
     * @param fromRlpBinary Unpack from RLP encoded transaction (default: false)
     * @param prefix Prefix of data
     * 
     * @returns { tx, rlpEncoded, binary } Object with tx -> Object with transaction param's, rlp encoded transaction and binary transaction
     */
    export function unpackTx(encodedTx : any, fromRlpBinary? : boolean /* = false */, prefix? : string /* = 'tx' */) : any
}

// -----------------------------------------------------------------------------
// es/ae


/**
 * See es/ae/index.js
 */
declare module '@aeternity/aepp-sdk/es/ae' {

    import {Accounts} from '@aeternity/aepp-sdk/accounts'
    import Chain from '@aeternity/aepp-sdk/es/chain/node'

    // FIXME: Is this really  Transaction | string
    export type SpendResult = {
        blockHash : string
        blockHeight : number
        hash        : string
        rawTx       : string
        signatures  : string[]

        tx : {
            amount      : number
            fee         : number
            nonce       : number
            payload     : string
            recipientId : string
            senderId    : string
            type        : string  // 'SpendTx'
            version     : 1
        }
    } | string

    /**
     * FIXME : const Ae = stampit(Tx, Account, Chain, {
     *            methods: { send, spend, transferFunds, destroyInstance, signUsingGA },
     */
    export interface Ae extends Account, Chain {

        /**
         * Send tokens to another account
         * @param amount Amount to spend
         * @param recipientId Address or Name of recipient account
         * @param options Options
         * @return Transaction or transaction hash
         */
        spend(amount : number | string, recipientId : string, options? : {} /*= {}*/) : Promise<SpendResult>
    }
}

/**
 * See es/ae/universal.js
 */
declare module '@aeternity/aepp-sdk/es/ae/universal' {

    import {Ae} from '@aeternity/aepp-sdk/es/ae'
    import Chain from '@aeternity/aepp-sdk/es/chain/node'
    import {Accounts} from '@aeternity/aepp-sdk/accounts'
    import Contract from '@aeternity/aepp-sdk/ae/contract'

    
    // export const Universal = Ae.compose(Accounts, Chain, Transaction, Aens, Contract, Oracle, GeneralizeAccount, {
    export interface Universal extends Ae, Accounts, Contract {

    }

    export function UniversalF(args : {
        
    }) : Promise<Universal>

    export default UniversalF;
}

/**
 * See es/index.js
 */
declare module '@aeternity/aepp-sdk/es' {

    import ChannelF from '@aeternity/aepp-sdk/es/channel'


    export const Channel = ChannelF

}



