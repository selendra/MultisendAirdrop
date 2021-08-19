const csv = require('csv-parser');
const { on } = require('events');
const fs = require('fs');

const init = async () => {

    let i;
    let count = 0;
    let b = 0;
    let wallets = [];
    fs.createReadStream('data/sameple_data.csv')
        .pipe(csv())
        .on('data', (row) => {
            //row._0.length
            for (i = 0; i < row._0.length; ++i)
                if (count == 300) {
                    // console.log(`Index 299: ${wallets[299]}`)
                    count = 0;
                    b++;
                }
            // console.log(count, row._0)
            wallets[count] = row._0;
            // Init transaction on smart contract
            // Sending Transaction Tranfer(_contract, wallet, _amount)
            count++;
        })
        .on('end', () => {
            console.log(`successfully processed ${b} batches`)
        });

}
init();