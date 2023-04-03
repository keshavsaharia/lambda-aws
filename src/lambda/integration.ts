import {
	Integration,
	GetIntegrationCommand
} from '@aws-sdk/client-apigatewayv2'

import { APIGateway } from '../gateway'
import { isString } from '../util'

export class APIGatewayIntegration {
	private gateway: APIGateway

	// For retrieving an integration or loading by ID
	private id?: string
	private integration?: Integration

	constructor(gateway: APIGateway, integration?: string | Integration) {
		this.gateway = gateway

		// Set integration
		if (integration == null) {}
		else if (isString(integration))
			this.id = integration
		else {
			this.integration = integration
			this.id = integration.IntegrationId
		}
	}

	async get() {
		const result = await this.gateway.getClient().send(new GetIntegrationCommand({
			ApiId: this.gateway.getId(),
			IntegrationId: this.id
		}))

		this.id = result.IntegrationId
		this.integration = result

	}

	getId() {
		return this.integration!.IntegrationId
	}

	getTimeout() {
		return this.integration!.TimeoutInMillis
	}

	isPublic() {
		return this.integration!.ConnectionType === 'INTERNET'
	}

	isPrivate() {
		return this.integration!.ConnectionType === 'VPC_LINK'
	}

}
