# SUPLOCK Protocol Frontend

A dark-themed DeFi interface for the SUPLOCK protocol on Supra L1, featuring vote-escrow locking, governance, yield vaults, and privacy mechanisms.

## Features

- **🔒 Token Locking**: Lock SUPRA tokens for 3-48 months with boost multipliers up to 2.5x
- **👑 veSUPRA NFTs**: Soulbound governance tokens with voting power
- **🗳️ Governance**: Create and vote on protocol proposals
- **⚡ Yield Vaults**: Auto-managed vaults with PT/YT token splitting
- **💰 SUPReserve**: Automated fee distribution with burns and dividends
- **🔐 LP Vacuum**: Privacy mode with encrypted transactions

## Quick Start

1. Open `suplock-frontend.html` in your browser
2. Click "Connect Wallet" (demo mode available)
3. Interact with the protocol features

## Design

- **Theme**: Dark background (#000/#111) with gold accents (#FFD700)
- **Icons**: Emojis for visual appeal (🔒⚡🗳️👑💰🔐)
- **Responsive**: Grid layout adapts to different screen sizes
- **Animations**: Fade-in effects for smooth UX

## Components

### Lock Interface
- Amount input with balance display
- Duration slider (3-48 months)
- Real-time boost calculation
- Lock button with validation

### veSUPRA Dashboard
- Current balance and boost multiplier
- Governance power status
- NFT representation

### Governance Panel
- Active proposals with voting buttons
- Create proposal functionality
- Vote tracking

### Yield Vaults
- Multiple vault options (SUPRA, EigenLayer)
- APY and TVL display
- Enter/exit functionality

### SUPReserve
- Total USDC collected
- Distribution breakdown
- Dividend claiming

### LP Vacuum
- Privacy mode toggle
- MEV protection stats
- Transaction encryption status

## Technical Stack

- **Frontend**: React (via CDN)
- **Styling**: Inline styles with CSS animations
- **Blockchain**: Mock Supra L1 integration
- **Charts**: Chart.js ready for data visualization

## Integration Points

The frontend is designed to integrate with:
- Supra L1 blockchain
- Move smart contracts
- Wallet providers (MetaMask, Supra Wallet)
- EigenLayer and Symbiotic protocols

## Development

To extend the frontend:
1. Add new components to the main SUPLOCK_APP function
2. Implement actual blockchain calls replacing mock functions
3. Add Chart.js visualizations for protocol metrics
4. Integrate with real Supra L1 wallet providers

## Security Features

- Input validation on all forms
- Disabled states for invalid operations
- Mock transaction logging
- Privacy mode indicators

## Deployment

The HTML file is self-contained and can be:
- Served from any web server
- Deployed to IPFS for decentralization
- Integrated into a Next.js or React app
- Hosted on Vercel, Netlify, or similar platforms

## License

Open source for the Supra L1 ecosystem.