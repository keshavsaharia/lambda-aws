import http from 'http'
import url from 'url'
import crypto from 'crypto'

const BODY_METHODS = new Set<string>(['POST', 'PATCH', 'PUT'])

import {
	APIGatewayProxyEvent,
	APIGatewayProxyEventV2,
	APIGatewayProxyResultV2
} from 'aws-lambda'

/**
 *
 * https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html#urls-payloads
 */

export async function proxyServer(handler: string, port: number = 3000): Promise<http.Server> {
	const delimiter = handler.lastIndexOf('.')
	const handlerPath = handler.substring(0, delimiter)
	const handlerFunction = handler.substring(delimiter + 1)

	const server = http.createServer((req, res) => {
		httpToProxyEvent(req)
			.then((event) => {
				delete require.cache[require.resolve(handlerPath)]
				return require(handlerPath)[handlerFunction](event)
			})
			.then((result) => {
				return proxyResultToHttp(result, res)
			})
			.then((proxied) => {
				// log request
			})
			.catch((error) => {
				console.log('error', error)
				// res.writeHead(500).end(error.toString())
			})
	})

	process.on('SIGTERM', () => stopServer())
    process.on('SIGINT', () => stopServer())

	const stopServer = function() {
		server.closeAllConnections()
	}

	return new Promise((resolve: (server: http.Server) => any) => {
		server.listen(port, () => {
			console.log('http://localhost:' + port)
			resolve(server)
		})
	})
}

export async function httpToProxyEvent(req: http.IncomingMessage): Promise<APIGatewayProxyEventV2> {
	const method = httpRequestMethod(req)
	const {
		rawPath,
		rawQueryString,
		queryStringParameters
		  } = httpRequestQuery(req)
	const headers = httpRequestHeaders(req)
	const body = await httpRequestBody(req)

	// Construct proxy object
	return {
		version: '2.0',
	    routeKey: '$default',
	    rawPath,
	    rawQueryString,
	    cookies: [],
	    headers,
	    queryStringParameters,
	    body,
	    isBase64Encoded: false,
	    stageVariables: {},
		requestContext: {
			accountId: process.env.AWS_ACCOUNT || 'AWS_ACCOUNT',
			apiId: '<url ID>',
		    routeKey: '$default',
		    requestId: crypto.randomUUID(),
			stage: '$default',
			time: '',
			timeEpoch: 12,
			http: {
				method,
				path: rawPath,
				protocol: 'HTTP/1.1',
				sourceIp: req.socket.remoteAddress || '',
				userAgent: req.headers['user-agent'] || ''
			},
			domainName: '',
			domainPrefix: ''
		}
	}
}

/**
 * Returns the uppercase HTTP method (GET, POST, ...)
 */
function httpRequestMethod(req: http.IncomingMessage): string {
	// Parse request method
	if (! req.method)
		throw new Error('invalid request method')
	return req.method.toUpperCase()
}

interface RequestQuery {
	rawPath: string,
	rawQueryString: string,
	queryStringParameters: { [key: string]: string }
}

function httpRequestQuery(req: http.IncomingMessage): RequestQuery {
	if (! req.url)
		throw new Error('invalid URL')

	// Get path from URL
	const target = url.parse(req.url)
	if (! target.pathname)
		throw new Error('invalid path')
	const rawPath = target.pathname

	// Parse query string parameters
	const rawQueryString = target.query || ''
	const queryStringParameters: { [key: string]: string } = {}
	if (target.query)
		for (const [key, value] of new URLSearchParams(target.query))
			queryStringParameters[key] = Array.isArray(value) ? value[0] : value

	return {
		rawPath,
		rawQueryString,
		queryStringParameters
	}
}

type RequestHeaders = { [key: string]: string }

function httpRequestHeaders(req: http.IncomingMessage): RequestHeaders {
	const headers: { [key: string]: string } = {}
	Object.keys(req.headers).forEach((key) => {
		const value = req.headers[key]
		if (value)
			headers[key] = Array.isArray(value) ? value[0] : value
	})

	return headers
}

async function httpRequestBody(req: http.IncomingMessage): Promise<string | undefined> {
	// Parse body string
	let body: string | undefined = undefined

	if (req.method && BODY_METHODS.has(req.method.toUpperCase())) {
		body = await new Promise((resolve: (body: string) => any) => {
			const chunks: Array<string> = []
			req.on('data', (chunk: string) => {
				chunks.push(chunk)
			})
			req.on('end', () => {
				resolve(chunks.join(''))
			})
		})
	}

	return body
}

export async function proxyResultToHttp(result: APIGatewayProxyResultV2, res: http.ServerResponse) {
	res.setHeader('Connection', 'close')
	if (typeof result === 'string') {
		res.writeHead(200)
		res.write(result)
	}
	else {
		res.writeHead(result.statusCode || 200)
		res.write(result.body)
		if (result.headers) {
			for (const key of Object.keys(result.headers)) {
				const value = result.headers[key]
				res.setHeader(key, value.toString())
			}
		}
	}
	res.end()
}
