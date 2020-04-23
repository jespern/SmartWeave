// Include dependencies.
const fs = require('fs')
const Arweave = require('arweave/node')
const argv = require('yargs').argv
const smartweave = require('smartweave')

// Set Arweave parameters from commandline or defaults.
const arweave_port = argv.arweavePort ? argv.arweavePort : 443
const arweave_host = argv.arweaveHost ? argv.arweaveHost : 'arweave.net'
const arweave_protocol = argv.arweaveProtocol ? argv.arweaveProtocol : 'https'

if(!argv.walletFile) {
    console.log("ERROR: Please specify a wallet file to load using argument " +
        "'--wallet-file <PATH>'.")
    process.exit()
}

const raw_wallet = fs.readFileSync(argv.walletFile)
const wallet = JSON.parse(raw_wallet)

const arweave = Arweave.init({
    host: arweave_host, // Hostname or IP address for an Arweave node
    port: arweave_port,
    protocol: arweave_protocol
})

if(argv.create) {
    if(!argv.contractSrc) {
        console.log("ERROR: Please specify contract source bundle using argument " +
            "'--contract-source <PATH>'.")
        process.exit()
    }
    const contractSrc = fs.readFileSync(argv.contractSrc)

    if(!argv.initState) {
        console.log("ERROR: Please specify a file defining an initial state with " +
            "'--init-state <PATH>'.")
        process.exit()
    }

    const minDiff = argv.minDiff ? argv.minDiff : 10

    const initState = fs.readFileSync(argv.initState)

    const contractID =
        smartweave.createContract(Arweave, wallet, contractSrc, initState, minDiff)

    console.log("Contract created in TX " + contractID)
}

if(argv.interact) {
    if(!argv.contract) {
        console.log("ERROR: Please specify a contract to interact with using " +
            "'--contract <TXID>'.")
        process.exit()
    }
    const contractID = argv.contract

    if(argv.inputFile) {
        const input = fs.readFileSync(argv.inputFile)
    }
    else if(argv.input) {
        const input = argv.input
    }
    else {
        console.log("ERROR: Please specify input to the contract using " +
            "'--input \"INPUT VAR\"' or '--input-file <FILE>'.")
        process.exit()
    }

    const TXID = smartweave.interact(Arweave, wallet, contract, input)

    if(!TXID) {
        console.log("ERROR: Contract execution on input failed.\n\nINPUT:\n" + input)
    }
    else {
        console.log("Contract interaction submitted with TXID: " + TXID)
    }
}

if(argv.getState) {
    if(!argv.contract) {
        console.log("ERROR: Please specify a contract to interact with using " +
            "'--contract <TXID>'.")
        process.exit()
    }
    const contractID = argv.contract

    const state = smartweave.getState(Arweave, contractID)

    if(!state) {
        console.log("ERROR: Failed to get state for contract " + contractID)
    }

    console.log(state)
}