export interface CloudFrontService {
	distribution?: string
	cache?: boolean | CloudFrontCacheBehavior | CloudFrontCache
}

export type CloudFrontCacheBehavior = 'disabled' | 'enabled' | 'optimized' | 'optimize-uncompressed' | 'media'

export interface CloudFrontCache {

}
