export type Region =
	'us-east-1' | 'us-east-2' |
	'us-west-1' | 'us-west-2' |
	'ap-southeast-1' | 'ap-southeast-2' | 'ap-southeast-3' | 'ap-southeast-4' |
	'ap-northeast-1' | 'ap-northeast-2' | 'ap-northeast-3' |
	'ap-south-1' | 'ap-south-2' | 'ap-east-1' |
	'me-south-1' | 'me-central-1' |
	'eu-west-1' | 'eu-west-2' | 'eu-west-3' |
	'eu-south-1' | 'eu-south-2' | 'eu-north-1' |
	'eu-central-1' | 'eu-central-2' |
	'sa-east-1' | 'af-south-1' | 'ca-central-1'

export const Regions: Region[] = [
	// US Regions
	'us-east-1',		// Virginia
	'us-west-1',		// California
	'us-east-2',		// Ohio
	'us-west-2',		// Oregon

	// Southeast Asia
	'ap-southeast-1',	// Singapore
	'ap-southeast-2',	// Australia
	'ap-southeast-3',	// Jakarta, Phillipines
	'ap-southeast-4',	// Melbourne

	// Northeast Asia
	'ap-northeast-1',	// Tokyo, Japan
	'ap-northeast-2',	// Seoul, South Korea
	'ap-northeast-3',	// Osaka, Japan

	// India
	'ap-south-1',		// Mumbai, India
	'ap-south-2',		// Hyderabad, India
	'ap-east-1',		// Hong Kong*

	// Middle east
	'me-south-1',		// Middle east (Bahrain)
	'me-central-1',		// Middle east (UAE)

	// Europe
	'eu-west-1', 		// Ireland
	'eu-west-2',		// London UK
	'eu-west-3',		// Paris France
	'eu-south-1',		// Milan Italy
	'eu-south-2',		// Spain
	'eu-north-1',		// Stockholm Sweden
	'eu-central-1',		// Frankfurt Germany
	'eu-central-2', 	// Zurich

	// Single regions
	'ca-central-1',		// Canada
	'sa-east-1',		// South America (Sao Paolo)
	'af-south-1'		// Cape Town, South Africa
]
