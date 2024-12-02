const HDwalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const compiledFactory = require("./build/Factory.json");
require('dotenv').config();


console.log( process.env.Wallet_Phrase, process.env.Wallet_Address);
const provider = new HDwalletProvider(
  process.env.Wallet_Phrase,
  process.env.Wallet_Address,
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account ", accounts[0]);
  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: "1000000", from: accounts[0] });
  console.log("Contract Deployed to  ", result.options.address);
  provider.engine.stop();
};

deploy();
