/**
 * This file contains example code, i.e. it's never used, but
 * nice to have when copying examples
 */

import * as utils from './utils'
import * as ae_utils from './ae-utils'

/**
 *
 */
export async function callContractEntryPoint1() {
    // Get the universal flavor
    const universal = await ae_utils.getCachedUniversal()

    // Load contract source
    const contractSrc = await utils.getContract('contract-1.aes')

    // Compile
    const compileResult = await universal.contractCompile(contractSrc)

    // Deploy
    const deployResult = await compileResult.deploy([])

    // Call entrypoint bar(1, 23)
    const callResult = await deployResult.call('bar', ['1', '23'])

    // Log result
    const r = callResult.result
    console.log('returnValue=' + r.returnValue)
    console.log('gasPrice=' + r.gasPrice)
    console.log('gasUsed=' + r.gasUsed)
    console.log('height=' + r.height)

    // Decode result value
    const decodedValue = await callResult.decode()
    console.log('decodedValue=' + decodedValue)
}