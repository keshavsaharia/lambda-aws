# lambda-aws

A command line utility for quickly deploying AWS Lambda with other AWS services.

- [CloudFront](#cloudfront) to host sites
- [API Gateway](#api-gateway) to handle API gateway REST/WebSocket requests
- [SES](#ses) to manage email status notifications
- [SNS](#sns) to manage notifications

## Features

- **Multi-region deployment** - create a Lambda function and corresponding resources in each region that an app is deployed
-

## Setup

Initialize a Lambda configuration for this

```
laws init
```

### Configuration file

In `lambda-aws.json`

```json
{
	"name": "function-name",
	"region": ["us-east-1"],
	"prefix": {
		"dev": "dev-"
	},
	"suffix": {
		"production": "-live"
	},
	"service": [
		{
			"id": "cloudfront",
			"domain": "myfunction.com",
			"handler": "frontend",
			"aws": {
				"distribution": "XYZ123EABC123",
				"cache": false
			}
		},
		{
			"id": "api-gateway",
			"domain": "",
			"regional": true,
			"aws": {
				"api_id": "a1235"
			}
		},
		{
			"id": "websocket",
			"service": "api-gateway-ws"
		}
	],
	"handler": {
		"server": "dist/server.handler",
		"worker": "dist/worker.handler"
	},
	"memory": {
		"server": 256,
		"default": 128
	}
}
```

## Deployment

```
laws deploy
```

## Monitoring

```
laws status
```

Prints
- state of regions
- deployment
- services linked

## CloudFront
