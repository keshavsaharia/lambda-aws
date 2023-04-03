import { DomainName } from './name'

describe('route 53 test', () => {

	it('should list all hosted zones', async () => {
		const domains = await DomainName.list()
		expect(domains.length).toBeGreaterThan(0)
	})

	it('can find a hosted zone', async () => {
		const domain = await DomainName.find('adatascienti.st')
		if (domain != null) {
			const records = await domain.getRecords()
			
		}

		// console.log(records)
	})

})
