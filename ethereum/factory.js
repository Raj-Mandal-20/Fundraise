import web3 from "./web3";
import CampaignFactory from "../ethereum/build/Factory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xeD95800d059A6631aAE449f130eA7C661d322311"
);

export default instance;