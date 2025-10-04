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

  // Deploy Mock WBTC first
  await deploy("MockWBTC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  const mockWBTC = await hre.ethers.getContract<Contract>("MockWBTC", deployer);
  console.log("🪙 MockWBTC deployed at:", await mockWBTC.getAddress());

  // Deploy Mock USDC
  await deploy("MockUSDC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  const mockUSDC = await hre.ethers.getContract<Contract>("MockUSDC", deployer);
  console.log("💵 MockUSDC deployed at:", await mockUSDC.getAddress());

  // Deploy IplikciFinance with token addresses
  await deploy("IplikciFinance", {
    from: deployer,
    args: [await mockWBTC.getAddress(), await mockUSDC.getAddress()],
    log: true,
    autoMine: true,
  });

  const iplikciFinance = await hre.ethers.getContract<Contract>("IplikciFinance", deployer);
  console.log("💰 IplikciFinance deployed!");
  console.log("📊 Supply APY:", await iplikciFinance.supplyEarnBps(), "bps (basis points)");
  console.log("💳 Borrow Fee Rate:", await iplikciFinance.borrowFeeBps(), "bps (basis points)");
};

export default deployIplikciFinance;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags IplikciFinance
deployIplikciFinance.tags = ["IplikciFinance"];
