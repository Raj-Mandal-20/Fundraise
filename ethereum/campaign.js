import web3 from "./web3";
import Campaign from "../ethereum/build/Campaign.json";

export default (address) => {
  const instance = new web3.eth.Contract(
    JSON.parse(Campaign.interface),
    address
  );
  return instance;
};
