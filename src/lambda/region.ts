import {
	LambdaClient,
	ListFunctionsCommand
} from '@aws-sdk/client-lambda'

import { Region } from '../region'
import { LambdaFunction } from '.'

export class LambdaRegion {
	private client: LambdaClient
	private region: Region

	/**
	 * @constructor
	 */
	constructor(region: Region) {
		this.client = new LambdaClient({ region })
		this.region = region
	}

	/**
	 * @func 	listFunctions
	 * @desc 	List all Compute functions in the given AWS region
	 */
	async listFunctions(): Promise<LambdaFunction[]> {
		const functions: LambdaFunction[] = []
		let next: string | undefined

		while (true) {
			const result = await this.client.send(new ListFunctionsCommand({
				MaxItems: 50,	// Maximum items per page
				Marker: next	// Paginate to next result
			}))

			// Add a function instance for each returned configuration
			if (result.Functions && result.Functions.length > 0)
				functions.push(...result.Functions.map((configuration) =>
					new LambdaFunction(this, configuration.FunctionName!).setConfiguration(configuration)))

			// Paginate through results
			if (result.NextMarker)
				next = result.NextMarker
			else break
		}
		return functions
	}

	async hasFunction(name: string) {

	}

	getId(): Region {
		return this.region
	}

	getName() {
		return this.region
	}

	getClient() {
		return this.client
	}
}
