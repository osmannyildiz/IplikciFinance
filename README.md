# FIplikci

> Live on Monad Testnet.<br/>
> Contract: [0x4E472Ed61dc0434614Ab8779064C68138C7459A4](https://testnet.monadexplorer.com/address/0x4E472Ed61dc0434614Ab8779064C68138C7459A4)<br/>
> Demo: [fiplikci.osmannyildiz.cc](https://fiplikci.osmannyildiz.cc)

A simple lending protocol built for the Monad network. This is a hackathon project designed for speed and simplicity.

## Features

### 🏦 Core Functionality

- **Supply MON**: Deposit MON tokens to earn 8% APY
- **Withdraw MON**: Withdraw your supplied MON plus earned interest anytime
- **Borrow MON**: Borrow MON by providing 120% collateral
- **Repay Loan**: Repay your loan to get your collateral back

### 📊 Key Parameters

- **Supply APY**: 8% (800 basis points)
- **Collateral Ratio**: 120% (12000 basis points)
- **Borrow Fee**: 10% (1000 basis points) - one-time upfront fee

### 🎯 Credit Score System

- Earn +1 credit score for each supply
- Earn +2 credit score for each loan repayment
- Credit scores are tracked on-chain and visible in the UI

### ⚡ Simplicity

- **No liquidation mechanism** - simplified for hackathon speed
- **No position health tracking** - users manage their own positions
- **Single active loan per user** - one borrow position at a time
- **Instant transactions** - no waiting periods

## Smart Contract

### Contract: `IplikciFinance.sol`

**Location**: `packages/hardhat/contracts/IplikciFinance.sol`

**Deployed Address** (localhost): `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

### Main Functions

#### Supply Functions

```solidity
// Supply MON to the protocol
function supplyMon() public payable

// Withdraw MON from the protocol
function withdrawMon(uint256 amount) public

// Calculate earned interest
function calculateEarned(address user) public view returns (uint256)
```

#### Borrow Functions

```solidity
// Borrow MON by providing collateral
function borrowMon(uint256 borrowAmount) public payable

// Repay loan and get collateral back
function repayMon() public payable
```

#### View Functions

```solidity
function getSupplyPosition(address user) public view returns (uint256 amount, uint256 earned, uint256 timestamp)
function getBorrowPosition(address user) public view returns (uint256 collateral, uint256 borrowed, uint256 timestamp)
function supplyMonApy() public view returns (uint256)
function borrowMonFeeRate() public view returns (uint256)
```

#### Admin Functions (Owner Only)

```solidity
function setSupplyMonEarnBps(uint256 newRate) public onlyOwner
function setBorrowMonCollateralBps(uint256 newRate) public onlyOwner
function setBorrowMonFeeBps(uint256 newRate) public onlyOwner
function emergencyWithdraw() public onlyOwner
```

## Frontend UI

### Main Features

1. **Dashboard View**
   - Real-time display of Supply APY, Borrow Fee Rate, and Credit Score
   - User's supply position with earned interest
   - User's borrow position with collateral info

2. **Supply Section**
   - Input field to supply MON
   - Input field to withdraw MON
   - Real-time balance updates

3. **Borrow Section**
   - Input field for borrow amount
   - Input field for collateral (shows required amount)
   - Repay button when loan is active
   - Automatic collateral calculation

4. **Info Section**
   - Clear explanation of how the protocol works
   - Key metrics and parameters

## Development Setup

### Prerequisites

- Node.js 18+
- Yarn
- Git

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

### Running Locally

1. **Start the local blockchain**:

```bash
yarn chain
```

2. **Deploy the contracts** (in a new terminal):

```bash
yarn deploy
```

3. **Start the frontend** (in a new terminal):

```bash
yarn start
```

4. **Open the app**:
   - Navigate to `http://localhost:3000`
   - Click "Launch App" or go directly to `http://localhost:3000/iplikci-finance`

### Testing

Run the comprehensive test suite:

```bash
cd packages/hardhat
yarn test test/IplikciFinance.ts
```

All 10 tests should pass:

- ✅ Deployment tests
- ✅ Supply functionality tests
- ✅ Borrow functionality tests
- ✅ Admin functions tests

## Usage Examples

### Supply MON

1. Connect your wallet
2. Navigate to FIplikci page
3. Enter amount in "Amount to Supply" field
4. Click "Supply MON"
5. Confirm transaction
6. Your position will update with earned interest

### Borrow MON

1. Connect your wallet
2. Navigate to FIplikci page
3. Enter desired borrow amount
4. Enter collateral amount (must be at least 120% of borrow amount)
5. Click "Borrow MON"
6. Confirm transaction
7. You'll receive borrowed amount minus 10% fee

### Repay Loan

1. Navigate to FIplikci page
2. If you have an active loan, you'll see "Repay Full Loan" button
3. Click the button
4. Confirm transaction with the full loan amount
5. Your collateral will be returned

## Architecture

### Smart Contract Architecture

- Built with Solidity 0.8.20
- Uses OpenZeppelin's Ownable for access control
- Simple interest calculation for earnings
- Struct-based position tracking
- Event emission for all state changes

### Frontend Architecture

- Next.js 14 with App Router
- TypeScript for type safety
- Scaffold-ETH 2 hooks for blockchain interaction
- TailwindCSS + DaisyUI for styling
- Real-time contract data fetching with wagmi hooks

### Key Technologies

- **Smart Contracts**: Hardhat, Solidity, OpenZeppelin
- **Frontend**: Next.js, React, TypeScript
- **Blockchain Interaction**: Wagmi, Viem, RainbowKit
- **Testing**: Chai, Hardhat Test Environment

## Security Considerations

⚠️ **This is a hackathon project and NOT production-ready!**

Known limitations:

- No liquidation mechanism (users can be under-collateralized)
- No position health monitoring
- No oracle for price feeds
- Simple interest calculation (not compound)
- Single admin with emergency withdraw capability
- No pause mechanism
- No time locks on admin functions

## Gas Costs

Based on test runs:

- Deploy: ~957,751 gas
- Supply: ~95,064 - 112,164 gas
- Withdraw: ~48,649 gas
- Borrow: ~123,865 gas
- Repay: ~44,899 gas

## Future Enhancements (Post-Hackathon)

- [ ] Add liquidation mechanism
- [ ] Implement position health monitoring
- [ ] Add compound interest calculation
- [ ] Multiple loan support per user
- [ ] Variable interest rates based on utilization
- [ ] Support for multiple collateral types
- [ ] Oracle integration for price feeds
- [ ] Governance token for protocol control
- [ ] Time locks and emergency pause functionality
- [ ] Advanced analytics dashboard

## License

MIT License

## Contributing

This is a hackathon project. Feel free to fork and improve!

## Contact

For questions or suggestions, please open an issue.

---

Built with ❤️ for Monad Blitz Hackathon
