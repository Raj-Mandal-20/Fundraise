require("dotenv").config();

const instanceAddress = process.env.REACT_APP_Contract_Instance;
const Wallet_Address = process.env.Wallet_Address;

const info = () => ({
  instanceAddress: instanceAddress,
  Wallet_Address: Wallet_Address,
});

console.log(instanceAddress);


export default info;