import {
	ACMClient,
	ResourceRecord,
	CertificateDetail,
	RequestCertificateCommand,
	DescribeCertificateCommand,
	ListCertificatesCommand
} from '@aws-sdk/client-acm'

import {
	Route53Client,
	ChangeResourceRecordSetsCommand
} from '@aws-sdk/client-route-53'

import {
	ViewerCertificate
} from '@aws-sdk/client-cloudfront'

import { DomainName } from '../domain'
import { CertificateRegion } from '.'

/**
 * @class 	Certificate
 * @desc 	Represents a certificate
 */
export class Certificate {
	// Static client for Route 53 verification
	private static domainClient?: Route53Client
	private client: ACMClient

	// ACM region deployment and certificate details
	private region: CertificateRegion
	private detail?: CertificateDetail
	private id?: string

	private domain: DomainName[] = []

	// Status
	private status?: string

	constructor(region: CertificateRegion, id?: string) {
		this.region = region
		this.id = id
		// this.domain = domain
		// this.arn = arn
	}

	setDomain(...domain: DomainName[]): this {
		this.domain = domain
		return this
	}

	async request() {
		const result = await this.client.send(new RequestCertificateCommand({
			// First domain in array is
			DomainName: this.domain[0].getName(),
			SubjectAlternativeNames: this.domain.length > 1 ?
				this.domain.slice(1).map((domain) => domain.getName()) : undefined,
			ValidationMethod: 'DNS'
		}))

		this.id = result.CertificateArn
		return this.validate()
	}

	async get(): Promise<this> {
		const result = await this.client.send(new DescribeCertificateCommand({
			CertificateArn: this.id
		}))

		if (result.Certificate) {
			const certificate = result.Certificate
			this.detail = certificate
			this.status = certificate.Status
		}
		return this
	}

	async validate() {
		if (! this.id)
			throw new Error('invalid ARN') // TODO

		await this.get()

		// Validate each record in the domain validation options
		if (this.detail && this.detail.DomainValidationOptions != null) {
			const records: ResourceRecord[] = []
			const recordName: Map<string, Set<string>> = new Map()

			for (const validation of this.detail.DomainValidationOptions) {
				const record = validation.ResourceRecord
				if (!record || ! record.Name || ! record.Value)
					continue

				if (! recordName.has(record.Name) || ! recordName.get(record.Name)!.has(record.Value)) {
					records.push(record)
					recordName.set(record.Name, new Set([ record.Value ]))
				}
			}

			await Certificate.getDomainClient().send(new ChangeResourceRecordSetsCommand({
				ChangeBatch: {
					Changes: records.map((record) => ({
						Action: 'CREATE',
						ResourceRecordSet: {
							Name: record.Name,
							ResourceRecords: [
								{ Value: record.Value }
							],
							TTL: 60,
							Type: record.Type
						}
					})),
					Comment: 'ACM validation'
				},
				HostedZoneId: this.domain[0].getId()
			}))
		}
	}

	/**
	 * Returns the viewer certificate configuration from CloudFront
	 */
	getViewerCertificate(): ViewerCertificate {
		return {
			CloudFrontDefaultCertificate: false,
			ACMCertificateArn: this.getArn(),
			Certificate: this.getArn(),
			CertificateSource: 'acm',
			MinimumProtocolVersion: 'TLSv1.1_2016',
			SSLSupportMethod: 'sni-only'
		}
	}

	setDetail(detail: CertificateDetail): this {
		this.detail = detail
		return this
	}

	getArn() {
		return this.id
	}

	setArn(arn: string): this {
		this.id = arn
		return this
	}

	isIssued() {
		return this.status === 'ISSUED'
	}

	isInactive() {
		return this.status === 'INACTIVE'
	}

	isExpired() {
		return this.status === 'EXPIRED'
	}

	isRevoked() {
		return this.status === 'REVOKED'
	}

	isFailed() {
		return this.status === 'FAILED'
	}

	validationPending() {
		return this.status === 'PENDING_VALIDATION'
	}

	validationTimedOut() {
		return this.status === 'VALIDATION_TIMED_OUT'
	}

	getClient() {
		return this.region.getClient()
	}

	static getDomainClient() {
		if (! Certificate.domainClient)
			Certificate.domainClient = new Route53Client({})
		return Certificate.domainClient
	}
}
