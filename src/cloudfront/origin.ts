import { Origins, Origin } from '@aws-sdk/client-cloudfront'
import { CloudFrontAuthorizer } from '.'

// External origins
import { LambdaFunction } from '../lambda'

export class CloudFrontOrigin {
	lambda?: LambdaFunction

	identity?: CloudFrontAuthorizer

	constructor(origin?: LambdaFunction) {
		if (! origin) {}
		else if (origin instanceof LambdaFunction)
			this.lambda = origin
	}

	getOrigin(): Origin {
		return {
			DomainName: this.lambda!.getDomainName(),
			Id: this.lambda!.getOriginName(),
			OriginPath: '',
			CustomHeaders: this.identity ? {
				Items: [
					{
						HeaderName: this.identity.getHeader(),
						HeaderValue: this.identity.getHeaderValue()
					}
				],
				Quantity: 1
			} : {
				Items: [],
				Quantity: 0
			},
			CustomOriginConfig: {
				HTTPPort: 80,
				HTTPSPort: 443,
				OriginSslProtocols: {
					Items: ['TLSv1.2'],
					Quantity: 1
				},
				OriginReadTimeout: 30,
				OriginKeepaliveTimeout: 10,
				OriginProtocolPolicy: 'https-only'
			}
		}
	}

}
