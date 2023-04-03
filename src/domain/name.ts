import {
	Route53Client,
	DelegationSet,
	ListHostedZonesCommand,
	ListResourceRecordSetsCommand,
	CreateHostedZoneCommand,
	GetHostedZoneCommand,
	DeleteHostedZoneCommand
} from '@aws-sdk/client-route-53'

import { DomainRecord } from '.'

export class DomainName {
	private static client: Route53Client = new Route53Client({})

	private id: string
	private name?: string
	private subdomain?: string

	private nameServers?: string[]
	private recordSize: number = 0

	/**
	 * @constructor
	 * @param 	{string} id - the hosted zone ID
	 * @param 	{string} name - domain name
	 */
	constructor(id: string, name?: string) {
		this.id = id
		this.name = name
	}

	/**
	 * @func 	getSubdomain
	 * @desc 	Get a representation of a subdomain of this domain name.
	 * @param 	{string} subdomain - prepend to domain name
	 */
	getSubdomain(subdomain: string): DomainName {
		return new DomainName(this.id, [ subdomain.replace(/\.$/, ''), this.name ].join('.'))
	}

	static async find(name: string): Promise<DomainName | null> {
		let next: string | undefined
		while (true) {
			const result = await DomainName.client.send(new ListHostedZonesCommand({
				Marker: next
			}))
			// Add to domains
			if (result.HostedZones) {
				const hostedZone = result.HostedZones.find((zone) => zone.Name && zone.Name.startsWith(name))
				if (hostedZone && hostedZone.Id)
					return new DomainName(hostedZone.Id, hostedZone.Name)
			}
			if (result.IsTruncated)
				next = result.NextMarker
			else break
		}
		return null
	}

	static async list(): Promise<DomainName[]> {
		const domains: DomainName[] = []
		let next: string | undefined
		while (true) {
			const result = await DomainName.client.send(new ListHostedZonesCommand({
				Marker: next
			}))
			// Add to domains
			if (result.HostedZones)
				domains.push(...result.HostedZones.map((zone) => new DomainName(zone.Id!, zone.Name)))
			if (result.IsTruncated)
				next = result.NextMarker
			else break
		}
		return domains
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

	async get(): Promise<this> {
		const result = await DomainName.client.send(new GetHostedZoneCommand({
			Id: this.id
		}))

		if (result.HostedZone) {
			this.name = result.HostedZone.Name
			this.recordSize = result.HostedZone.ResourceRecordSetCount || 0
		}
		// Store list of name servers
		if (result.DelegationSet)
			this.nameServers = result.DelegationSet.NameServers

		return this
	}

	async getRecords(): Promise<DomainRecord[]> {
		const records: DomainRecord[] = []
		let next: string | undefined
		while (true) {
			const result = await DomainName.client.send(new ListResourceRecordSetsCommand({
				HostedZoneId: this.id,
				StartRecordIdentifier: next
			}))

			if (result.ResourceRecordSets)
				records.push(...result.ResourceRecordSets.map((record) => new DomainRecord(this)))

			if (result.IsTruncated)
				next = result.NextRecordIdentifier
			else break
		}
		return records
	}

	async create() {
		// TODO

		await DomainName.client.send(new CreateHostedZoneCommand({
			Name: this.name,
			CallerReference: '',
			HostedZoneConfig: {
				Comment: ''
			}
		}))
	}

	async archive() {
		// TODO delete/archive resource records
		await DomainName.client.send(new DeleteHostedZoneCommand({
			Id: this.id
		}))
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name || ''
	}

	getNameServers(): string[] {
		return this.nameServers || []
	}
}
