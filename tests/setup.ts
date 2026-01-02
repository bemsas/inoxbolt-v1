import { beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(async () => {
  const baseUrl = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';
  console.log(`\n🧪 Running API tests against: ${baseUrl}\n`);

  // Verify the server is reachable
  try {
    const response = await fetch(`${baseUrl}/api/admin/documents`, {
      method: 'GET',
    });
    if (!response.ok && response.status !== 500) {
      console.warn(`⚠️  Warning: API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Cannot reach API server. Tests may fail.');
  }
});

afterAll(() => {
  console.log('\n✅ API tests completed\n');
});
