import {
	CloudFrontClient,
	CreateCloudFrontOriginAccessIdentityCommand
} from '@aws-sdk/client-cloudfront'

import { CLOUDFRONT_REGION } from './constant'

export class CloudFrontAuthorizer {
	private id: string

	constructor(id: string) {
		this.id = id
	}

	static async create(): Promise<CloudFrontAuthorizer> {
		const client = new CloudFrontClient({ region: CLOUDFRONT_REGION })
		const result = await client.send(new CreateCloudFrontOriginAccessIdentityCommand({
			CloudFrontOriginAccessIdentityConfig: {
				CallerReference: new Date().toISOString(),
				Comment: 'CF'
			}
		}))
		if (! result.CloudFrontOriginAccessIdentity)
			throw new Error('invalid identity')

		return new CloudFrontAuthorizer(result.CloudFrontOriginAccessIdentity.Id!)
	}

	getId(): string {
		return this.id
	}

	getHeader(): string {
		return ''
	}

	getHeaderValue(): string {
		return ''
	}
}
