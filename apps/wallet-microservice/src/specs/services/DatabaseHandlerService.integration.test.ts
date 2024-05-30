// test/DatabaseHandlerService.integration.test.js
import { PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import DatabaseHandlerService from '../../services/DatabaseHandlerService';
import { Currency, User } from '@shared-types/shared-types';
import dynamoDB from '../../db/DbConnection';

const service = new DatabaseHandlerService();

describe('DatabaseHandlerService Integration', () => {
  let user: User;
  beforeAll(async () => {
    user = {
      user_id: 'test-user',
      wallets: [
        {
          currency: Currency.SOL,
          balance: 1000,
          wagerRequirement: 0,
          address: 'addr1',
          lockedAt: '0',
        },
      ],
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
        Key: { user_id: 'test-user' },
      })
    );
  });
  it('should handle concurrent lock attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 10; i++) {
      attempts.push(
        service.lockWallet(user, Currency.SOL).catch((e) => e.message)
      );
    }

    const results = await Promise.all(attempts);
    console.log('Concurrent Lock Attempts Results:', results);
    const successCount = results.filter(
      (result) => result === undefined
    ).length;

    const failureCount = results.filter(
      (result) => result === 'The conditional request failed'
    ).length;

    console.log('Success Count:', successCount);
    console.log('Failure Count:', failureCount);

    expect(successCount).toStrictEqual(1);
    expect(failureCount).toStrictEqual(9);

    const wallet = await service.getWallet('test-user', Currency.SOL);
    console.log('Wallet after concurrent lock attempts:', wallet);
    expect(Number(wallet.lockedAt)).toBeGreaterThan(0);
  });

  it('should handle lock expiry correctly', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased timeout
    await service.lockWallet(user, Currency.SOL);
    console.log('Wallet locked');

    // Simulate lock expiry by waiting longer than the lock duration
    await new Promise((resolve) => setTimeout(resolve, 2200)); // Increased timeout

    await service.lockWallet(user, Currency.SOL);
    console.log('Wallet relocked after expiry');

    const updatedUserWallet = await service.getWallet(
      user.user_id,
      Currency.SOL
    );
    console.log('Updated User Wallet:', updatedUserWallet);
    expect(updatedUserWallet.lockedAt).not.toBe(0);
  });
});
