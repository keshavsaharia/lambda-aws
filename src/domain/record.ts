import {
	Change, ResourceRecordSet
} from '@aws-sdk/client-route-53'

import { CloudFrontDistribution } from '../cloudfront'
import { DomainName } from '.'

export class DomainRecord {
	private domain: DomainName
	private record?: ResourceRecordSet

	private subdomain?: string
	private cloudfront?: CloudFrontDistribution

	constructor(domain: DomainName) {
		this.domain = domain
	}

	forSubdomain(subdomain: string): this {
		this.subdomain = subdomain
		return this
	}

	forCache(cache: CloudFrontDistribution): this {
		this.record = {
			Name: this.getName(),
			Type: 'A',
			AliasTarget: {
				HostedZoneId: '',
				DNSName: cache.getDomainName(),
				EvaluateTargetHealth: false
			}
		}
		return this
	}

	getCreateChange(): Change {
		return {
			Action: 'CREATE',
			ResourceRecordSet: this.record
		}
	}

	getName(): string {
		if (this.subdomain != null) {
			return [ this.subdomain, this.domain.getName() ].join('.')
		}
		return this.domain.getName()
	}

	private setRecord(record?: ResourceRecordSet) {
		if (record)
			this.record = record
		return this
	}
}
