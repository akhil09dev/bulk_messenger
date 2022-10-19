const qrcode = require("qrcode-terminal");
const { Client, MessageMedia, NoAuth } = require("whatsapp-web.js");
const { exit } = require("process");
const csv = require("csv-parser");
const fs = require("fs");
const converter = require("json-2-csv");

let results = [];
let failed = [];
parsed = false;

fs.createReadStream("contact.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    parsed = true;
  });

// const media = MessageMedia.fromFilePath("img.png");

// msg2 =
//   "Exclusive benefits for you\n\n◇Internship vouchers on selected workshops\n◇Free exclusive NFTs on selected workshops\n◇Certificates for all participants\n\nFor further queries, please fill in: https://forms.gle/d3HJKNoUtPbS8myW7";


// Use the saved values
const client = new Client({
  puppeteer: { headless: false },
  authStrategy: new NoAuth()
});

// const client = new Client({
//   puppeteer: {
//     browserWSEndpoint: `ws://localhost:3000`,
//   },
//   authStrategy: new NoAuth()
// });


client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
});

async function Bulkmessage() {
  for (let i = 0; i < results.length; i++) {
    try {
      num = "";

      // ------------------------------------------------------------------EDIT HERE--------------------------------------------------
      msg1 =" hlooo"
      const name = results[i].Name.split(" ")[0]
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(" ");
      msg1 = msg1.replace("[name]", name);
      if (
        results[i].Phone_Number.replace(/\s/g, "").replace("+", "").length ===
        10
      ) {
        num = `91${results[i].Phone_Number.replace(/\s/g, "").replace(
          "+",
          ""
        )}@c.us`; // Add country code if it doesnt exist
      } else {
        num = `${results[i].Phone_Number.replace(/\s/g, "").replace(
          "+",
          ""
        )}@c.us`;
      }
      console.log(num);
      await client.sendMessage(num, msg1);
    
      await timer(3000);
    } catch (err) {
      failed.push(results[i]);
      console.log(`Message Not sent to ${results[i].Phone_Number}`);
      continue;
    }
  }

  console.log(failed);
  converter.json2csv(failed, (err, csv) => {
    if (err) {
      throw err;
    }
    // write CSV to a file
    fs.writeFileSync("failed.csv", csv);
  });
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

client.on("message_create", async (msg) => {
  if (msg.to === "919400167686@c.us") {
    if (msg.body === "!stop") {
      exit(0);
    }
    if (msg.body === "!start" && parsed) {
      Bulkmessage();
    }
  }
});

client.initialize();

