#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import { Configuration } from './type'
import { isServiceId } from './util'
// import { localCloudfront } from './cloudfront'

// Directory and utilities
const dir = process.cwd()
const configFile = path.join(dir, 'lambda-aws.json')

// Utilities for reading configuration
const hasConfig = () => fs.existsSync(dir) && fs.existsSync(configFile)
const readConfig = (): Configuration => JSON.parse(fs.readFileSync(configFile, 'utf8'))
const writeConfig = () => fs.writeFileSync(configFile, JSON.stringify(config, null, 4), 'utf8')
const defaultConfig = (): Configuration => ({
			name: path.basename(dir),
			prefix: { 'dev': 'dev-', 'prod': 'prod-' },
			domain: '',
			region: [],
			service: []
		})

// Configuration object
const config: Configuration = hasConfig() ? readConfig() : defaultConfig()

/**
 * INITIALIZATION
 * > laws init
 *
 * Create a configuration JSON file in this directory.
 */
function init() {
	if (hasConfig())
		throw new Error('already initialized')

	console.log('Writing configuration')
	writeConfig()
}

/**
 * ADD SERVICE
 * > laws add api/cloudfront
 */
function add(service: string) {
	if (! isServiceId(service))
		throw new Error('invalid service type')

	config.service.push({
		id: service,
		type: service,
		handler: 'dist/' + service + '.handler'
	})

	writeConfig()
}

function local(service: string) {
	switch (service) {
	case 'cloudfront': return localServer()
	}
}

function localServer() {

}

function logHelp() {
	console.log('laws init')
}

if (process.argv.length > 2) {
	const command = process.argv[2]
	try {
		switch (command) {
			case 'init': init(); break
			case 'add': add(process.argv[3]); break
			case 'local': local(process.argv[3]); break
		}
	}
	catch (error) {
		console.log(error.toString())
	}
}
else logHelp()
