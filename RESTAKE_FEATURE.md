# Cross‑Protocol Restake Page

This document describes the specialized `Restake` page added to the SUPLOCK frontend. The goal of the page is to
provide a single interface where users can bring SUPRA (or stSUPRA) that they have deposited in external Supra-based
protocols and redeploy it inside SUPLOCK’s vaults and pools for additional yield.

## Supported External Protocols

- **Supralend** – lending/borrowing pools where SUPRA is staked to earn interest. Positions can be unlocked and
  restaked into SUPLOCK vaults without leaving the Supra ecosystem.
- **Solido Money** – derivative iAssets (iSUPRA, etc.) which represent SUPRA/lending positions. An `Import` flow
  converts these to SUPRA or stSUPRA for SUPLOCK.
- **Atmos Protocol** – LP pools containing SUPRA pairs. Liquidity tokens or underlying SUPRA holdings can be
  imported and restaked.

## Page Layout

- **Navigation bar** updated to include `Restake` as a top-level menu item (desktop and mobile).
- **Hero section** explains the purpose: reuse SUPRA capital across ecosystems with compounding yields.
- **Protocol cards**: three matrix-style cards, each describing the source protocol with a `RESTAKE_FROM_{PROTOCOL}`
  button (stubbed for now) to trigger whatever import logic will be implemented later.
- **iAsset conversion** section describes converting derivative assets to SUPRA/stSUPRA before redeployment.

## Usage

1. User navigates to `/restake` from the main navigation.
2. Select the appropriate protocol card (e.g. Supralend) to begin the restaking flow.
3. The page will eventually integrate with wallet functions to pull positions and re-deposit them into SUPLOCK.

> **Note:** actual cross-protocol bridging and token conversions are _not yet implemented_. Current buttons are placeholders
> meant to be wired to backend logic or smart contract interactions in future work.

## Implementation Notes

- The page was created as `src/pages/Restake.tsx` and lazy-loaded using React `Suspense`.
- A corresponding test suite (`src/__tests__/Restake.test.tsx`) ensures the page renders correctly.
- Navigation items are mirrored in `Navbar.tsx` and the page includes an internal nav component for other sections.
- The new route is registered in `App.tsx` at `/restake`.

## Future Enhancements

- Connect the restake buttons to real contract calls (using Supra L1 SDK, Blink SDK, etc.).
- Display real balances from the connected wallet and partner protocols.
- Incorporate iAsset conversion utilities smart contracts.
- Add analytics/tracking to measure capital flows between protocols.
- UI/UX polish: modals, wizards and success screens.

## Testing

Run `npm run test` to execute the new `Restake.test.tsx` spec. The page requires React Router so tests wrap it in
`<BrowserRouter>`.

## Release Notes

This page was added in commit `2ede716` (see GitHub for details). Add any future changes under a new changelog entry.
