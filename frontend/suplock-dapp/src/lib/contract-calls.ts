import {
  SupraClient,
  SupraAccount,
  BCS,
  TxnBuilderTypes,
  TypeTagParser,
} from 'supra-l1-sdk';

// Contract addresses (update after deployment to testnet)
export const CONTRACT_ADDRESSES = {
  suplock_core: '0x0000000000000000000000000000000000000000000000000000000000000001',
  vesupra: '0x0000000000000000000000000000000000000000000000000000000000000002',
  supreserve: '0x0000000000000000000000000000000000000000000000000000000000000003',
  yield_vaults: '0x0000000000000000000000000000000000000000000000000000000000000004',
  supra_coin: '0x0000000000000000000000000000000000000000000000000000000000000005',
};

// Lock durations in days
export const LOCK_DURATIONS = {
  THREE_MONTHS: 90,
  SIX_MONTHS: 180,
  ONE_YEAR: 365,
  TWO_YEARS: 730,
  THREE_YEARS: 1095,
  FOUR_YEARS: 1460,
};

/**
 * Lock SUPRA tokens
 * @param client - Supra client instance
 * @param account - User's account
 * @param amountQuants - Amount in quants (1 SUPRA = 100,000,000 quants)
 * @param durationDays - Lock duration in days
 * @returns Transaction hash
 */
export async function lockSupraTokens(
  client: SupraClient,
  account: SupraAccount,
  amountQuants: bigint,
  durationDays: number
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.suplock_core,
      'suplock',
      'lock_tokens',
      [], // No generic type parameters
      [
        BCS.bcsSerializeUint64(amountQuants),
        BCS.bcsSerializeUint64(BigInt(durationDays)),
      ]
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error locking tokens:', error);
    throw error;
  }
}

/**
 * Get user's lock amount and duration
 * @param client - Supra client instance
 * @param userAddress - User's address
 * @returns Lock info { amount, duration, boost }
 */
export async function getUserLockInfo(client: SupraClient, userAddress: string): Promise<{
  amount: bigint;
  duration: number;
  boost: number;
}> {
  try {
    const result = await client.invokeViewMethod(
      CONTRACT_ADDRESSES.suplock_core,
      'suplock',
      'get_user_lock',
      [],
      [TxnBuilderTypes.AccountAddress.fromHex(userAddress).toUint8Array()]
    );

    // Parse result
    const [amountRaw, durationRaw, boostRaw] = result as any[];
    return {
      amount: BigInt(amountRaw),
      duration: Number(durationRaw),
      boost: Number(boostRaw) / 10000, // Boost stored as basis points
    };
  } catch (error) {
    console.error('Error fetching lock info:', error);
    return {
      amount: BigInt(0),
      duration: 0,
      boost: 1,
    };
  }
}

/**
 * Create a governance proposal
 * @param client - Supra client instance
 * @param account - Account creating proposal
 * @param proposalType - Type of proposal (0: revenue, 1: vault, 2: treasury)
 * @param description - Proposal description (as vector<u8>)
 * @param votingPeriodDays - Voting period in days (default 7)
 * @returns Transaction hash
 */
export async function createProposal(
  client: SupraClient,
  account: SupraAccount,
  proposalType: number,
  description: string,
  votingPeriodDays: number = 7
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.vesupra,
      'vesupra',
      'create_proposal',
      [],
      [
        BCS.bcsSerializeU8(proposalType),
        BCS.bcsSerializeStr(description),
        BCS.bcsSerializeUint64(BigInt(votingPeriodDays)),
      ]
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

/**
 * Vote on a governance proposal
 * @param client - Supra client instance
 * @param account - Voter's account
 * @param proposalId - Proposal ID
 * @param voteYes - True for yes vote, false for no
 * @returns Transaction hash
 */
export async function voteOnProposal(
  client: SupraClient,
  account: SupraAccount,
  proposalId: number,
  voteYes: boolean
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.vesupra,
      'vesupra',
      'vote',
      [],
      [
        BCS.bcsSerializeUint64(BigInt(proposalId)),
        BCS.bcsSerializeBool(voteYes),
      ]
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error voting on proposal:', error);
    throw error;
  }
}

/**
 * Get proposal details
 * @param client - Supra client instance
 * @param proposalId - Proposal ID
 * @returns Proposal info { state, votesFor, votesAgainst, endTime }
 */
export async function getProposal(
  client: SupraClient,
  proposalId: number
): Promise<{
  state: string;
  votesFor: bigint;
  votesAgainst: bigint;
  endTime: number;
}> {
  try {
    const result = await client.invokeViewMethod(
      CONTRACT_ADDRESSES.vesupra,
      'vesupra',
      'get_proposal',
      [],
      [BCS.bcsSerializeUint64(BigInt(proposalId))]
    );

    const [stateRaw, votesForRaw, votesAgainstRaw, endTimeRaw] = result as any[];
    return {
      state: ['pending', 'active', 'passed', 'failed', 'executed'][Number(stateRaw)],
      votesFor: BigInt(votesForRaw),
      votesAgainst: BigInt(votesAgainstRaw),
      endTime: Number(endTimeRaw),
    };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return {
      state: 'error',
      votesFor: BigInt(0),
      votesAgainst: BigInt(0),
      endTime: 0,
    };
  }
}

/**
 * Get treasury balance
 * @param client - Supra client instance
 * @returns Treasury balance in quants
 */
export async function getTreasuryBalance(client: SupraClient): Promise<bigint> {
  try {
    const result = await client.invokeViewMethod(
      CONTRACT_ADDRESSES.supreserve,
      'supreserve',
      'get_treasury_balance',
      [],
      []
    );

    return BigInt(result as any);
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return BigInt(0);
  }
}

/**
 * Get user's claimable dividends
 * @param client - Supra client instance
 * @param userAddress - User's address
 * @returns Claimable dividends in quants
 */
export async function getClaimableDividends(
  client: SupraClient,
  userAddress: string
): Promise<bigint> {
  try {
    const result = await client.invokeViewMethod(
      CONTRACT_ADDRESSES.supreserve,
      'supreserve',
      'get_claimable_dividends',
      [],
      [TxnBuilderTypes.AccountAddress.fromHex(userAddress).toUint8Array()]
    );

    return BigInt(result as any);
  } catch (error) {
    console.error('Error fetching claimable dividends:', error);
    return BigInt(0);
  }
}

/**
 * Claim dividends for user
 * @param client - Supra client instance
 * @param account - User's account
 * @returns Transaction hash
 */
export async function claimDividends(
  client: SupraClient,
  account: SupraAccount
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.supreserve,
      'supreserve',
      'claim_dividends',
      [],
      []
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error claiming dividends:', error);
    throw error;
  }
}

/**
 * Get total supply of SUPRA
 * @param client - Supra client instance
 * @returns Total supply in quants
 */
export async function getTotalSupply(client: SupraClient): Promise<bigint> {
  try {
    const result = await client.invokeViewMethod(
      '0x1',
      'supra_coin',
      'supply',
      [new TypeTagParser('0x1::supra_coin::SupraCoin').parseTypeTag()],
      []
    );

    return BigInt(result as any);
  } catch (error) {
    console.error('Error fetching total supply:', error);
    return BigInt(0);
  }
}

/**
 * Deposit into yield vault
 * @param client - Supra client instance
 * @param account - User's account
 * @param vaultId - Vault identifier
 * @param amount - Amount to deposit in quants
 * @returns Transaction hash
 */
export async function depositIntoVault(
  client: SupraClient,
  account: SupraAccount,
  vaultId: number,
  amount: bigint
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.yield_vaults,
      'yield_vaults',
      'deposit',
      [],
      [
        BCS.bcsSerializeU8(vaultId),
        BCS.bcsSerializeUint64(amount),
      ]
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error depositing into vault:', error);
    throw error;
  }
}

/**
 * Withdraw from yield vault
 * @param client - Supra client instance
 * @param account - User's account
 * @param vaultId - Vault identifier
 * @param amount - Amount to withdraw in quants
 * @returns Transaction hash
 */
export async function withdrawFromVault(
  client: SupraClient,
  account: SupraAccount,
  vaultId: number,
  amount: bigint
): Promise<string> {
  try {
    const seqNum = BigInt((await client.getAccountInfo(account.address())).sequence_number);

    const serializedTx = await client.createSerializedRawTxObject(
      account.address(),
      seqNum,
      CONTRACT_ADDRESSES.yield_vaults,
      'yield_vaults',
      'withdraw',
      [],
      [
        BCS.bcsSerializeU8(vaultId),
        BCS.bcsSerializeUint64(amount),
      ]
    );

    const response = await client.sendTxUsingSerializedRawTransaction(serializedTx, account);
    return response.txHash || '';
  } catch (error) {
    console.error('Error withdrawing from vault:', error);
    throw error;
  }
}
