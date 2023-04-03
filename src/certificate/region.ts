import {
	ACMClient,
	ListCertificatesCommand
} from '@aws-sdk/client-acm'

import { Region } from '../region'
import { Certificate } from '.'

export class CertificateRegion {
	private client: ACMClient
	private region: Region

	constructor(region: Region) {
		this.client = new ACMClient({ region })
	}


	async list(): Promise<Certificate[]> {
		const certificates: Certificate[] = []
		let next: string | undefined

		while (true) {
			const result = await this.client.send(new ListCertificatesCommand({
				NextToken: next
			}))

			if (result.CertificateSummaryList) {
				result.CertificateSummaryList.forEach((summary) => {
					const certificate = new Certificate(this)
					// certificate.setDetail(summary)
					return certificate
				})
			}

			if (result.NextToken)
				next = result.NextToken
			else break
		}

		return certificates
	}

	getClient() {
		return this.client
	}
}
