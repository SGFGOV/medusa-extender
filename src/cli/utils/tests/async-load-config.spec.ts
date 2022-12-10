import { asyncLoadConfig } from '../async-load-config';
const runLoadTest = async (testFixtureFileName: string) => {
	const testProjectConfig = {
		database_database: './medusa-db.sql',
		database_type: 'sqlite',
		store_cors: 'STORE_CORS',
		admin_cors: 'ADMIN_CORS',
	};
	const configModule = await asyncLoadConfig(`${__dirname}/../fixtures/`, `${testFixtureFileName}.js`);
	expect(configModule).toBeDefined();
	expect(configModule.projectConfig).toBeDefined();
	expect(configModule.projectConfig).not.toBeInstanceOf(Promise);
	expect(configModule.projectConfig.database_password).not.toBeInstanceOf(Promise);
	expect(configModule.projectConfig).toMatchObject(testProjectConfig);
	const testPasswordParameter = configModule.projectConfig.database_password;
	expect(typeof testPasswordParameter == 'string' || typeof testPasswordParameter == 'function').toBe(true);

	if (typeof testPasswordParameter == 'string') {
		expect(testPasswordParameter).toBe('password');
	} else {
		/** testing callback function */
		const password = await testPasswordParameter();
		expect(password).toBe('password');
	}
};

describe('async load tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.clearAllTimers();
	});

	it('should aysnc load medusa-config with non-async', async () => {
		await runLoadTest('default-case-non-async-data');
	});

	it('should aysnc load medusa-config with async data', async () => {
		await runLoadTest('async-parameter');
	});
	it('should aysnc load medusa-config with async function promising non-async data', async () => {
		await runLoadTest('async-function-with-non-async-data');
	});
	it('should aysnc load medusa-config with async function promising async data', async () => {
		await runLoadTest('async-function-with-async-parameter');
	});
});
