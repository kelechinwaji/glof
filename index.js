const fs = require('fs');
const {createHash} = require('crypto');
const csv = require('csvtojson');
const fsp = fs.promises;
const {parse} = require('csv-parse');
const {stringify} = require('csv-stringify');

const filename = 'HNGi9 CSV FILE - Sheet1'
const writableStream = fs.createWriteStream(`./csv/${filename}.output.csv`)


// const filename = 'HNGi9 CSV FILE - Sheet1'

const hash =[];

const converter = async()=>{
  const jsonArray = await csv().fromFile(`${filename}.csv`);
  return jsonArray
};


const transformer = async () =>{
    const result = await converter();
    result.forEach(async(e)=>{
        let json = {
            format: "CHIP-0007",
            $id: e.UUID,
            name: e.Filename,
            description: e.Description,
            minting_tool: filename,
            sensitive_content: false,
            series_number: Number(e["Series Number"]),
            series_total: 526,
            attributes:[
                {
                    trait_type: "Gender",
                    value: e.Gender,
                },
            ],
            collection: {
                name: "Zuri NFT Tickets for Free Lunch",
                id: "b774f676-c1d5-422e-beed-00ef5510c64d",
                attributes: [
                    {
                        type: "description",
                        value: "Rewards for accomplishments during HNGi9.",
                    },
                ],
            },
        };
        await fsp.writeFile(`./json/${json.name}.json`, JSON.stringify(json));
        let readFile = await fsp.readFile(`./json/${json.name}.json`);

        const hashed = createHash("sha256").update(readFile).digest("hex");
        hash.push(hashed);
    });
    writeCSV();
    function writeCSV(){
        //This defines the columns of the new csv file
        const columns = [
            "Series Number",
            "Filename",
            "Description",
            "Gender",
            "UUID",
            "Hash",

        ];

        // This writes the columns of the new csv file
        const csv_writer = stringify({header: true, columns: columns});

        // This writes the data of the new csv file
        for (let i = 0; i < result.length; i++){
            result[i][result[i].length - 1] = hash[i];

            csv_writer.write(result[i]);
        }

        csv_writer.pipe(writableStream);

        console.log("Done");
    }
}

transformer()