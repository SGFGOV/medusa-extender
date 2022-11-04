import { unlinkSync, writeFileSync } from 'fs';
import { asyncLoadConfig } from '../async-load-config';
import {
	asyncDataWithAsyncFunctionAndAsyncParameter,
	asyncFunctionWithAsyncData,
	asyncyFunctionWithNonAsyncData,
} from '../fixtures/asyn-load-config-test-fixture';
const pathToConfigFile = `${process.cwd()}/medusa-config.js`;
const runLoadTest = async (testFixture: string) => {
	const dummyMedusaConfig = testFixture;

	const testProjectConfig = {
		database_database: './medusa-db.sql',
		database_type: 'sqlite',
		database_password: 'password',
		store_cors: 'STORE_CORS',
		admin_cors: 'ADMIN_CORS',
	};

	writeFileSync(pathToConfigFile, dummyMedusaConfig);
	const fixture = require.resolve(pathToConfigFile);
	expect(fixture).toBeDefined();
	const configModule = await asyncLoadConfig();
	expect(configModule).toBeDefined();
	expect(configModule.projectConfig).toBeDefined();
	expect(configModule.projectConfig).not.toBeInstanceOf(Promise);
	expect(configModule.projectConfig.database_password).not.toBeInstanceOf(Promise);
	expect(configModule.projectConfig.database_password.length).toBeGreaterThan(0);
	expect(configModule.projectConfig).toMatchObject(testProjectConfig);
};

describe('async load tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.clearAllTimers();
	});

	afterEach(() => {
		unlinkSync(pathToConfigFile);
	});

	it('should aysnc load medusa-config with non-async', async () => {
		await runLoadTest(asyncyFunctionWithNonAsyncData);
	});

	it('should aysnc load medusa-config with async data', async () => {
		await runLoadTest(asyncFunctionWithAsyncData);
	});
	it('should aysnc load medusa-config with async data with async function', async () => {
		await runLoadTest(asyncDataWithAsyncFunctionAndAsyncParameter);
	});
});