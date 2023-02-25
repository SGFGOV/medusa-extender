import loaders from '@medusajs/medusa/dist/loaders';
import * as getEndpoints from 'express-list-endpoints';
import { Express } from 'express';
import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { asyncLoadConfig, Logger, Type } from './core';
import {
	adminApiLoader,
	customApiLoader,
	databaseLoader,
	modulesLoader,
	overrideEntitiesLoader,
	overrideRepositoriesLoader,
	pluginsLoadersProvidersAndListeners,
	servicesLoader,
	storeApiLoader,
	subscribersLoader,
	validatorsLoader,
} from './loaders';
import { asFunction } from 'awilix';

// Use to fix MiddlewareService typings
declare global {
	type ExpressApp = Express;
}

const logger = Logger.contextualize('Medusa');

/**
 * Load medusa and apply all components
 */
export class Medusa {
	readonly #express: Express;
	readonly #rootDir: string;

	/**
	 * @param rootDir Directory where the `medusa-config` is located
	 * @param express Express instance
	 */
	constructor(rootDir: string, express: Express) {
		this.#express = express;
		this.#rootDir = rootDir;
	}

	/**
	 * @param modules The modules to load into medusa
	 */
	public async load(modules: Type[]): Promise<MedusaContainer> {
		const configModule = await asyncLoadConfig(this.#rootDir, 'medusa-config');
		const moduleComponentsOptions = await modulesLoader(modules, configModule);
		await validatorsLoader(moduleComponentsOptions.get('validator') ?? []);
		await overrideEntitiesLoader(moduleComponentsOptions.get('entity') ?? []);
		
		await customApiLoader(
			this.#express,
			moduleComponentsOptions.get('middleware') ?? [],
			moduleComponentsOptions.get('router') ?? []
		);
		await adminApiLoader(
			this.#express,
			moduleComponentsOptions.get('middleware') ?? [],
			moduleComponentsOptions.get('router') ?? []
		);
		await storeApiLoader(
			this.#express,
			moduleComponentsOptions.get('middleware') ?? [],
			moduleComponentsOptions.get('router') ?? []
		);
		const dataSource = await databaseLoader(
			moduleComponentsOptions.get('entity') ?? [],
			moduleComponentsOptions.get('repository') ?? [],
			moduleComponentsOptions.get('migration') ?? []
		);
		await pluginsLoadersProvidersAndListeners(this.#express, moduleComponentsOptions.get('provider') ?? []);
		await servicesLoader(moduleComponentsOptions.get('service') ?? []);
		await subscribersLoader(moduleComponentsOptions.get('subscriber') ?? []);

		const { container } = await loaders({
			isTest: process.env.NODE_ENV === 'test',
			directory: this.#rootDir,
			expressApp: this.#express,
		});

		container.register("dataSource",asFunction(()=>dataSource).singleton())

		const endPoints = getEndpoints(this.#express);
		for (const endPoint of endPoints) {
			endPoint.methods.map((method) => {
				logger.push('Route Mapped {%s, %s}', endPoint.path, method);
			});
		}
		logger.flush();

		return container as any;
	}
}
