import { Contract } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploys a contract named "IplikciFinance" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployIplikciFinance: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("IplikciFinance", {
    from: deployer,
    // Contract constructor arguments (none for IplikciFinance)
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const iplikciFinance = await hre.ethers.getContract<Contract>("IplikciFinance", deployer);
  console.log("💰 IplikciFinance deployed!");
  console.log("📊 Supply APY:", await iplikciFinance.supplyMonEarnBps(), "bps (basis points)");
  console.log("💳 Borrow Fee Rate:", await iplikciFinance.borrowMonFeeBps(), "bps (basis points)");

  // Deploy Mock WBTC
  await deploy("MockWBTC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("🪙 MockWBTC deployed!");

  // Deploy Mock USDC
  await deploy("MockUSDC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("💵 MockUSDC deployed!");
};

export default deployIplikciFinance;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags IplikciFinance
deployIplikciFinance.tags = ["IplikciFinance"];
