// test/DatabaseHandlerintegration.test.js
import { PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import dynamoDB from '../../db/DbConnection';
import { Wallet } from '@shared-types/shared-types';
import {
  lockWallet,
  getWallet,
} from '@wallet-microservice/repository/Repository';

describe('DatabaseHandlerService Integration', () => {
  let user: Wallet;
  beforeAll(async () => {
    user = {
      userId: 'test-user',
      balance: 100,
      wagerRequirement: 0,
      address: 'test-address',
      lockedAt: '0',
    };
    await dynamoDB.send(
      new PutCommand({
        TableName: process.env.AWS_WALLETS_TABLE_NAME,
        Item: user,
      })
    );
  });
  // Set up the test table with necessary items

  afterAll(async () => {
    // Clean up test table
    await dynamoDB.send(
      new DeleteCommand({
        TableName: process.env.AWS_WALLETS_TABLE_NAME,
        Key: { userId: 'test-user' },
      })
    );
  });

  it('should handle concurrent lock attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 10; i++) {
      attempts.push(lockWallet(user.userId).catch((e) => e.message));
    }

    const results = await Promise.all(attempts);
    console.log('Concurrent Lock Attempts Results:', results);
    const successCount = results.filter(
      (result) => result === undefined
    ).length;

    const failureCount = results.filter(
      (result) => result === 'The conditional request failed'
    ).length;
    expect(successCount).toStrictEqual(1);
    expect(failureCount).toStrictEqual(9);

    const wallet = await getWallet('test-user');

    console.log('Wallet after concurrent lock attempts:', wallet);
    expect(Number(wallet.lockedAt)).toBeGreaterThan(0);
  });

  it('should handle lock expiry correctly', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased timeout
    await lockWallet(user.userId);
    console.log('Wallet locked');

    // Simulate lock expiry by waiting longer than the lock duration
    await new Promise((resolve) => setTimeout(resolve, 2200)); // Increased timeout

    await lockWallet(user.userId);
    console.log('Wallet relocked after expiry');

    const updatedUserWallet = await getWallet(user.userId);
    console.log('Updated User Wallet:', updatedUserWallet);

    expect(updatedUserWallet.lockedAt).not.toBe(0);
  });
});
