import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IplikciFinance } from "../typechain-types";

describe("IplikciFinance", function () {
  let iplikciFinance: IplikciFinance;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const iplikciFinanceFactory = await ethers.getContractFactory("IplikciFinance");
    iplikciFinance = (await iplikciFinanceFactory.deploy()) as IplikciFinance;
    await iplikciFinance.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await iplikciFinance.supplyMonEarnBps()).to.equal(800); // 8%
      expect(await iplikciFinance.borrowMonCollateralBps()).to.equal(12000); // 120%
      expect(await iplikciFinance.borrowMonFeeBps()).to.equal(1000); // 10%
    });

    it("Should set the owner correctly", async function () {
      expect(await iplikciFinance.owner()).to.equal(owner.address);
    });
  });

  describe("Supply", function () {
    it("Should allow users to supply MON", async function () {
      const supplyAmount = ethers.parseEther("10");

      await expect(iplikciFinance.connect(user1).supplyMon({ value: supplyAmount }))
        .to.emit(iplikciFinance, "MonSupplied")
        .withArgs(user1.address, supplyAmount, 1);

      const position = await iplikciFinance.getSupplyPosition(user1.address);
      expect(position[0]).to.equal(supplyAmount); // amount
      expect(await iplikciFinance.creditScores(user1.address)).to.equal(1);
    });

    it("Should reject supply with 0 amount", async function () {
      await expect(iplikciFinance.connect(user1).supplyMon({ value: 0 })).to.be.revertedWith(
        "Amount must be greater than 0",
      );
    });

    it("Should allow users to withdraw MON", async function () {
      const withdrawAmount = ethers.parseEther("5");

      await expect(iplikciFinance.connect(user1).withdrawMon(withdrawAmount)).to.emit(iplikciFinance, "MonWithdrawn");

      const position = await iplikciFinance.getSupplyPosition(user1.address);
      expect(position[0]).to.be.lessThan(ethers.parseEther("10"));
    });
  });

  describe("Borrow", function () {
    it("Should allow users to borrow MON with collateral", async function () {
      // First, supply some MON to the contract as liquidity
      await iplikciFinance.connect(user2).supplyMon({ value: ethers.parseEther("100") });

      const borrowAmount = ethers.parseEther("10");
      const requiredCollateral = ethers.parseEther("12"); // 120% of borrow amount

      await expect(iplikciFinance.connect(user1).borrowMon(borrowAmount, { value: requiredCollateral })).to.emit(
        iplikciFinance,
        "MonBorrowed",
      );

      const position = await iplikciFinance.getBorrowPosition(user1.address);
      expect(position[0]).to.equal(requiredCollateral); // collateral
      expect(position[1]).to.equal(borrowAmount); // borrowed
    });

    it("Should reject borrow with insufficient collateral", async function () {
      const borrowAmount = ethers.parseEther("10");
      const insufficientCollateral = ethers.parseEther("10"); // Less than 120%

      // Use a different user who doesn't have an active loan
      await expect(
        iplikciFinance.connect(user2).borrowMon(borrowAmount, { value: insufficientCollateral }),
      ).to.be.revertedWith("Insufficient collateral");
    });

    it("Should allow users to repay loan and get collateral back", async function () {
      const position = await iplikciFinance.getBorrowPosition(user1.address);
      const borrowedAmount = position[1];

      const initialCreditScore = await iplikciFinance.creditScores(user1.address);

      await expect(iplikciFinance.connect(user1).repayMon({ value: borrowedAmount })).to.emit(
        iplikciFinance,
        "MonRepaid",
      );

      const newPosition = await iplikciFinance.getBorrowPosition(user1.address);
      expect(newPosition[1]).to.equal(0); // No more borrowed amount

      const finalCreditScore = await iplikciFinance.creditScores(user1.address);
      expect(finalCreditScore).to.equal(initialCreditScore + BigInt(2)); // Credit score increased by 2
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update rates", async function () {
      await iplikciFinance.connect(owner).setSupplyMonEarnBps(1000); // 10%
      expect(await iplikciFinance.supplyMonEarnBps()).to.equal(1000);

      await iplikciFinance.connect(owner).setBorrowMonCollateralBps(15000); // 150%
      expect(await iplikciFinance.borrowMonCollateralBps()).to.equal(15000);

      await iplikciFinance.connect(owner).setBorrowMonFeeBps(500); // 5%
      expect(await iplikciFinance.borrowMonFeeBps()).to.equal(500);
    });

    it("Should reject non-owner from updating rates", async function () {
      await expect(iplikciFinance.connect(user1).setSupplyMonEarnBps(2000)).to.be.reverted;
    });
  });
});
