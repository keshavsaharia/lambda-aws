
export type ServiceId = 'api' | 'websocket' | 'cloudfront' | 'event'
export type ServiceType = 'api' | 'websocket' | 'cloudfront' | 'event' | 'db-stream'

export type ServiceData = { [key: string]: any }

/**
 * @interface 	Configuration
 * @desc 		Contained in a JSON configuration file
 */
export interface Configuration {
	// Typescript flag, defaults to true/tsconfig.json
	typescript?: boolean | true
	typescriptConfig?: string | 'tsconfig.json'

	// Lambda function name with prefix/suffix name based on node environment
	name: string
	prefix?: { [key: string]: string }
	suffix?: { [key: string]: string }

	domain: string | string[]

	// Regions to deploy to with the given services
	region: string[]
	service: Service[]
}

/**
 * @interface 	Service
 * @desc 		Identifies a specific service for deployment
 */
export interface Service<Data extends ServiceData = ServiceData> {
	// The unique ID of this service deployment, defaults to same as service type
	id?: string

	// Service type and associated AWS data
	type: ServiceType
	aws?: Data

	// Associated domain name if relevant
	domain?: string

	// Path to handler function, memory allocation. Default handler function is
	// "[SERVICE ID].handler"
	handler?: string
	memory?: number
}
