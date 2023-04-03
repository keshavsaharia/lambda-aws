import {
	FunctionConfiguration,
	CreateFunctionCommand,
	CreateFunctionUrlConfigCommand,
	AddPermissionCommand,
	GetFunctionCommand
} from '@aws-sdk/client-lambda'

import {
	LambdaRegion
} from '.'

/**
 * @class 	ComputeFunction
 * @desc 	Represents a Compute function
 */
export class LambdaFunction {
	private region: LambdaRegion

	// Deployment object associated with this function, and associated Compute configuration
	// if the function exists in AWS and has been deployed
	private name: string
	private configuration?: FunctionConfiguration

	// Configuration and exists flag
	private functionExists?: boolean

	private handler: string = 'dist/index.handler'
	private memorySize: number = 256

	constructor(region: LambdaRegion, name: string) {
		this.region = region
		this.name = name
	}

	async exists(): Promise<boolean> {
		if (this.functionExists != null)
			return this.functionExists

		try {
			await this.get()
			return true
		}
		catch (error) {
			return false
		}
	}

	async get(): Promise<this> {
		const result = await this.region.getClient().send(new GetFunctionCommand({
			FunctionName: this.getName()
		}))

		if (result.Configuration)
			this.setConfiguration(result.Configuration)
		return this
	}

	async create(): Promise<this> {
		if (await this.exists())
			return this

		const result = await this.region.getClient().send(new CreateFunctionCommand({
			FunctionName: this.getName(),
			Role: '', //region.getRole().getArn(),
			Runtime: 'nodejs16.x',
			Description: this.getDescription(),
			Handler: this.getHandler(),
			MemorySize: this.getMemorySize(),
			Publish: true,
			Code: {
				ZipFile: new Buffer('')
			}
		}))

		return this.setConfiguration(result)
	}

	async createUrl() {
		const result = await this.region.getClient().send(new CreateFunctionUrlConfigCommand({
			FunctionName: this.getName(),
			AuthType: 'NONE',
			Cors: {
				AllowCredentials: true,
				AllowHeaders: ['X-CloudFront-Sec-Token', 'Origin', 'Date', 'Keep-Alive'],
				AllowMethods: ['HEAD', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
				AllowOrigins: [ 'https://' ]
			}
		}))

		await this.region.getClient().send(new AddPermissionCommand({
			FunctionName: this.getName(),
			StatementId: 'PublicAccess',
			FunctionUrlAuthType: 'NONE',
			Principal: '*',
			Action: 'lambda:InvokeFunctionUrl'
		}))


	}

	getName(): string {
		if (this.configuration)
			return this.configuration.FunctionName!
		return this.name
	}

	getOriginName(): string {
		return [ this.region.getId(), this.getName() ].join('_')
	}

	getDomainName(): string {
		return ''
	}

	getDescription(): string {
		if (this.configuration)
			return this.configuration.Description!
		return ''
	}

	setConfiguration(configuration: FunctionConfiguration): this {
		this.configuration = configuration
		this.functionExists = true
		return this
	}

	getHandler() {
		return this.handler
	}

	getMemorySize() {
		return this.memorySize
	}
}
