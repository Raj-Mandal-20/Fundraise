const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/Factory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let CampaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  console.log(accounts);
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory._methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  [CampaignAddress] = await factory._methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    CampaignAddress
  );
});

describe("Campaign Contract", () => {
  it("Deployes a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign._methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute money and  marks them as a approvers", async () => {
    await campaign._methods.contribute().send({
      from: accounts[1],
      value: "200",
    });

    assert.ok(await campaign._methods.approvers(accounts[1]).call());
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign._methods.contribute().send({
        from: accounts[2],
        value: "50",
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Allows a manager to make payment request ", async () => {
    await campaign._methods
      .createRequest("Buy Battries", 100000, accounts[6])
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    const request = await campaign._methods.requests(0).call();
    assert.equal("Buy Battries", request.description);
  });

  it("Process Requests", async () => {
    await campaign._methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign._methods
      .createRequest(
        "Buy Battries",
        web3.utils.toWei("5", "ether"),
        accounts[5]
      )
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    await campaign._methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campaign._methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[5]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);
    console.log(balance);
    assert(balance > 1004);
  });
});
