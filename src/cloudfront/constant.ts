import { CloudFrontCacheBehavior } from './type'

export const CLOUDFRONT_REGION = 'us-east-1'

export const CACHE_BEHAVIOR_ID: Record<CloudFrontCacheBehavior, string> = {
	'disabled': '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
	'optimized': '658327ea-f89d-4fab-a63d-7e88639e58f6',
	'optimize-uncompressed': 'b2884449-e4de-46a7-ac36-70bc7f1ddd6d',
	'enabled': '658327ea-f89d-4fab-a63d-7e88639e58f6',
	'media': '08627262-05a9-4f76-9ded-b50ca2e3a84f'
}
