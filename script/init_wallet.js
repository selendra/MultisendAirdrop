require("dotenv").config()
const csv = require('csv-parser');
const { on } = require('events');
const fs = require('fs');

const ethers = require('ethers');
const { ADDRGETNETWORKPARAMS } = require("dns");
const mnemonic = process.env.MNEMONIC.toString().trim();
const url = process.env.URL.toString().trim();

/*
    Import ABI contract 
*/
var jsonFile = "build/contracts/Airdrop.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
const abi = parsed.abi;
const WProvider = new ethers.providers.JsonRpcProvider(url);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function tx(_address) {

    try {
        // Initializing Network
        await WProvider.ready;

        // Create Wallet
        let wallet = ethers.Wallet.fromMnemonic(mnemonic);
        let SenderAccount = new ethers.Wallet(wallet.privateKey, WProvider);

        const AirdropContract = new ethers.Contract(process.env.AIRDROP_CONTRACT.toString().trim(), abi, SenderAccount);

        // await WProvider.getBlockNumber().then((result) => {
        //     console.log("*** Initializing Transaction At Blocknumber: " + result);
        // })

        // Initializing Transaction
        const createReceipt = await AirdropContract.doAirdrop(process.env.TOKEN_CONTRACT.toString().trim(), _address, ethers.utils.parseEther("10"));
        await createReceipt.wait();
        console.log(`Tx successful with hash: ${createReceipt.hash}`);

    } catch (err) {
        console.log(err)
    }
}

async function BachProcessing(_batchAddress) {
    let count = 0;
    let b = 0;
    let wallets = [];

    for (let i = 0; i < _batchAddress.length; i++) {
        if (count == 5) {
            console.log("Batches : ", b, ", ", wallets)
            await tx(wallets);
            await sleep(20000);
            count = 0;
            b++
        }

        wallets[count] = _batchAddress[i];
        count++;
    }
}

async function FetchWallets() {
    try {
        var data = fs.readFileSync(process.env.DATA_WALLET)
            .toString() // convert Buffer to string
            .split('\r\n' && ' ') // split string to lines
            .map(e => e.trim()) // remove white spaces for each line
            .map(e => e.split(',').map(e => e.trim())); // split each line to array

        BachProcessing(data[0]);

    } catch (err) {
        console.log(err)
    }
}

const init = async () => {

    await FetchWallets().then(data => console.log(data));

}
init();