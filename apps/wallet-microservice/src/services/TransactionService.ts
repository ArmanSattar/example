import { Wallet } from '@shared-types/shared-types';
import { InsufficientBalanceError } from '@shared-errors/InsufficientBalanceError';
import { InvalidInputError } from '@shared-errors/InvalidInputError';
import RemoteService from '../remote/TreasuryRemote';
import { ResourceNotFoundError } from '@shared-errors/ResourceNotFoundError';
import {
  lockWallet,
  depositToDb,
  unlockWallet,
  withdrawFromDb,
  addWallet,
} from '@wallet-microservice/repository/Repository';
import { getCurrentPrice } from '../remote/JupiterRemote';

const MIN_WITHDRAWAL_AMOUNT_SOL = 0.1;

export const handleDeposit = async (
  remoteService: RemoteService,
  userId: string,
  walletAddress: string,
  base64Transaction: string
): Promise<void> => {
  try {
    const wallet = await lockWallet(userId);

    const depositTransactionResponse =
      await remoteService.broadcastDepositTransaction(
        userId,
        walletAddress,
        base64Transaction
      );

    const currentPriceSol = await getCurrentPrice();
    const depositAmountInCrypto = depositTransactionResponse.depositAmount;
    const depositAmountInUsd = depositAmountInCrypto * currentPriceSol;

    await depositToDb(
      wallet,
      depositAmountInUsd,
      depositTransactionResponse.transactionId
    );
  } catch (error: unknown) {
    console.error('Error handling deposit:', error);
    throw new Error('Error handling deposit');
  } finally {
    await unlockWallet(userId);
  }
};

export const handleWithdrawal = async (
  remoteService: RemoteService,
  userId: string,
  walletAddress: string,
  amount: number
): Promise<void> => {
  if (amount < MIN_WITHDRAWAL_AMOUNT_SOL) {
    throw new InvalidInputError(
      `Invalid withdrawal amount. Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT_SOL} SOL`
    );
  }

  try {
    const wallet = await lockWallet(userId);

    if (!wallet) {
      throw new ResourceNotFoundError('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new InsufficientBalanceError('Insufficient balance');
    }

    if (wallet.wagerRequirement > 0) {
      throw new InvalidInputError(
        `You still have an active wager requirement of $${wallet.wagerRequirement}`
      );
    }

    const currentPriceSol = await getCurrentPrice();
    const withdrawalAmountInSol = amount / currentPriceSol;

    const signature = await remoteService.broadcastWithdrawalTransaction(
      userId,
      withdrawalAmountInSol,
      walletAddress
    );

    await withdrawFromDb(wallet, amount, signature);
  } catch (error: unknown) {
    console.error('Error handling withdrawal:', error);
    throw new Error('Error handling withdrawal');
  } finally {
    await unlockWallet(userId);
  }
};

export const getWallet = async (userId: string): Promise<Wallet> => {
  return await getWallet(userId);
};

export const getBalance = async (userId: string): Promise<number> => {
  return await getBalance(userId);
};

export const createWallet = async (
  userId: string,
  walletAddress: string
): Promise<Wallet> => {
  return await addWallet(userId, walletAddress);
};

export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<void> => {
  try {
    const wallet = await lockWallet(userId);
    await depositToDb(wallet, amount, null, false);
  } finally {
    await unlockWallet(userId);
  }
};
