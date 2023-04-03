import {
	CloudFrontClient,
	Distribution,
	DistributionSummary,
	DistributionConfig,
	Origins, Aliases,
	ViewerCertificate,
	DefaultCacheBehavior,
	ListDistributionsCommand,
	GetDistributionCommand,
	CreateDistributionCommand,
	UpdateDistributionCommand,
	ListTagsForResourceCommand
} from '@aws-sdk/client-cloudfront'

import { Certificate } from '../certificate'
import {
	CloudFrontOrigin
} from '.'

import { Configuration, Service } from '../type'
import { CloudFrontService } from './type'

import { CLOUDFRONT_REGION } from './constant'

export class CloudFrontDistribution {
	private client: CloudFrontClient

	private config?: Configuration
	private service?: Service<CloudFrontService>

	private id: string							// CloudFront distribution ID
	private configuration?: DistributionConfig	// Loaded configuration
	private summary?: DistributionSummary 		// Distribution summary
	private etag?: string						// ETag for updating

	private arn?: string						// Amazon resource number
	private domainName?: string 				// Cloudfront domain name (xyz.cloudfront.net)

	// Associated client objects
	private certificate: Certificate

	private url: string
	private origin: CloudFrontOrigin[] = []
	private alias: string[] = []


	static async list(): Promise<CloudFrontDistribution[]> {
		const client = new CloudFrontClient({})
		const items: CloudFrontDistribution[] = []

		// Page through all distributions
		let next: string | undefined
		do {
			const result = await client.send(new ListDistributionsCommand({
				Marker: next
			}))

			const distributions = result.DistributionList

			if (distributions && distributions.Items && distributions.Items.length > 0) {
				items.push(...distributions.Items.map((item) => {
					return new CloudFrontDistribution()
				}))
				if (distributions.IsTruncated)
					next = distributions.NextMarker
			}
			else break
		}
		while (next != null)


		return items
	}

	constructor(config?: Configuration, service?: Service<CloudFrontService>) {
		this.client = new CloudFrontClient({ region: CLOUDFRONT_REGION })
		this.config = config
		this.service = service || { type: 'cloudfront' }
	}

	async create(): Promise<this> {
		const origins = await this.getOrigins()

		const result = await this.client.send(new CreateDistributionCommand({
			DistributionConfig: {
				Enabled: true,
				Origins: origins,
				Aliases: this.getAliases(),
				ViewerCertificate: this.certificate.getViewerCertificate(),
				DefaultCacheBehavior: this.getCacheBehavior(origins),
				Comment: this.getComment(),
				CallerReference: '',
				PriceClass: 'PriceClass_All'
			}
		}))

		return this.setDistribution(result.Distribution, result.ETag)
	}

	async update(): Promise<this> {
		const result = await this.client.send(new UpdateDistributionCommand({
			Id: this.getId(),
			IfMatch: this.getETag(),
			DistributionConfig: this.configuration
		}))

		return this.setDistribution(result.Distribution, result.ETag)
	}

	async exists(): Promise<boolean> {
		try {
			await this.get()
			return true
		}
		catch (error) {
			return false
		}
	}

	async get() {
		const result = await this.client.send(new GetDistributionCommand({
			Id: this.id
		}))
		this.setDistribution(result.Distribution, result.ETag)
		return this
	}

	async getTags() {
		this.client.send(new ListTagsForResourceCommand({
			Resource: this.getArn()
		}))
	}

	async getOrigins(): Promise<Origins> {
		return {
			Items: [
				// {
				// 	DomainName: cdnDomain + '.s3.amazonaws.com',
				// 	Id: 'S3-' + APP_NAME,
				// 	S3OriginConfig: {
				// 		OriginAccessIdentity: 'origin-access-identity/cloudfront/' + accessId
				// 	}
				// }
			],
			Quantity: 1
		}
	}

	async getComputeOrigins(): Promise<Origins> {
		return {
			Items: [

			],
			Quantity: 0
		}
	}

	getTargetOriginId(): string {
		return ''
	}

	getAliases(): Aliases {
		// If no domain configuration is set
		if (! this.config)
			return { Items: [], Quantity: 0 }

		// If there are multiple domain aliases
		if (Array.isArray(this.config.domain))
			return {
				Items: this.config.domain,
				Quantity: this.config.domain.length
			}

		// Single domain alias
		return {
			Items: [
				this.config.domain
			],
			Quantity: 1
		}
	}

	private getCacheBehavior(origins: Origins): DefaultCacheBehavior {
		return this.getComputeCacheBehavior(origins)
	}

	private getStorageCacheBehavior(origins: Origins): DefaultCacheBehavior {
		return {
			TargetOriginId: origins.Items![0].Id,
			ViewerProtocolPolicy: 'redirect-to-https',
			AllowedMethods: {
				Items: [
					'HEAD', 'GET', 'OPTIONS'
				],
				CachedMethods: {
					Items: ['HEAD', 'GET', 'OPTIONS'],
					Quantity: 3
				},
				Quantity: 3
			},
			CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
			OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf'
		}
	}

	private getComputeCacheBehavior(origins: Origins): DefaultCacheBehavior {
		return {
			TargetOriginId: origins.Items![0].Id,
			CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
			ViewerProtocolPolicy: 'redirect-to-https',
			AllowedMethods: {
				Items: [
					'GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'
				],
				Quantity: 7
			},
			SmoothStreaming: false
		}
	}

	getComment(): string {
		return ''
	}

	getDomainName(): string {
		if (! this.domainName)
			throw new Error('not loaded')
		return this.domainName
	}



	getId(): string {
		return this.id
	}

	getArn(): string {
		if (! this.arn)
			throw new Error('not loaded')
		return this.arn
	}

	setDistribution(config?: Distribution, etag?: string): this {
		if (config) {
			this.arn = config.ARN
			this.domainName = config.DomainName
			this.configuration = config.DistributionConfig
		}
		this.etag = etag
		return this
	}

	getETag(): string | undefined {
		return this.etag
	}



}
