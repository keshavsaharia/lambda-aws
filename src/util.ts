
import {
	Configuration,
	Service, ServiceId, ServiceData
} from './type'
import { SERVICE_ID } from './constant'

export function getName(config: Configuration): string {
	const env = process.env.NODE_ENV
	let name = config.name
	if (! isString(name))
		throw new Error('invalid name')

	if (env) {
		if (config.prefix && config.prefix[env])
			name = config.prefix[env] + name
		if (config.suffix && config.suffix[env])
			name = name + config.suffix[env]
	}

	return name
}

export function getServiceName(config: Configuration, service: string): string {
	return [ getName(config), service ].join('_')
}

export function getServiceDescription(config: Configuration, service: string): string {
	return [ getName(config), service ].join('_')
}

export function getService<S extends ServiceData>(config: Configuration, service: string): Service<S> | undefined {
	if (! Array.isArray(config.service))
		return undefined

	return config.service.find((s) => ((s.id || s.type) === service)) as Service<S>
}

export function isString(str: any): str is string {
	return str != null && typeof str === 'string'
}

export function isServiceId(service: any): service is ServiceId {
	return isString(service) && SERVICE_ID.has(service)
}
