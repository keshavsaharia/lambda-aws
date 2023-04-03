import {
	ApiGatewayV2Client,
	CreateApiCommand,
	GetApiCommand,
	CreateAuthorizerCommand,
	GetIntegrationsCommand
} from '@aws-sdk/client-apigatewayv2'

import { Configuration, Service } from '../type'
import { getServiceName } from '../util'

export interface APIGatewayData {
	api_id?: string
}

export class APIGateway {
	private client: ApiGatewayV2Client
	private config: Configuration
	private service: Service<APIGatewayData>

	constructor(region: string, config: Configuration, service: Service<APIGatewayData>) {
		this.client = new ApiGatewayV2Client({ region })
		this.config = config
		this.service = service
	}

	async create() {
		const result = await this.client.send(new CreateApiCommand({
			Name: this.getName(),
			ProtocolType: 'HTTP',
			ApiKeySelectionExpression: '$request.header.x-api-key',
			Description: this.getDescription(),
			RouteSelectionExpression: '$request.method $request.path'
		}))

		this.setApiId(result.ApiId!)
	}

	// async getIntegrations() {
	// 	const result = await this.region.getClient().send(new GetIntegrationsCommand({
	// 		ApiId: this.id
	// 	}))
	//
	// 	result.Items.forEach((item) => {
	//
	// 	})
	// }

	async get() {
		const result = await this.client.send(new GetApiCommand({
			ApiId: this.getApiId()
		}))

		this.setApiId(result.ApiId!)
		// this.endpoint = result.ApiEndpoint

		return this
	}

	async createAuthorizer() {
		await this.client.send(new CreateAuthorizerCommand({
			ApiId: this.getId(),
			Name: this.getName(),
			AuthorizerType: 'JWT',
			IdentitySource: ['$request.header.Authorization'],
			JwtConfiguration: {
				Audience: [

				]
			}
		}))
	}

	async exists(): Promise<boolean> {
		return false
	}

	getId(): string {
		return this.service.id || this.service.type
	}

	getApiId(): string {
		if (! this.service.aws)
			throw new Error('not loaded/created')

		return this.service.aws.api_id!
	}

	setApiId(id: string) {
		if (! this.service.aws)
			this.service.aws = {}
		this.service.aws.api_id = id
	}

	getName() {
		return getServiceName(this.config, this.getId())
	}

	getDescription() {
		return 'API integration'
	}

	getClient() {
		return this.client
	}

}
