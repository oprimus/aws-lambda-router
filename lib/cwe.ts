import { Context, ScheduledEvent } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';

export type CweEvent = ScheduledEvent

export interface CweRoute {
  source: string | RegExp
  action: (scheduledEvent: ScheduledEvent, context: Context) => Promise<any> | any
}

export interface CweConfig {
  routes: CweRoute[];
  debug?: boolean;
}

export const process: ProcessMethod<CweConfig, CweEvent, Context, any> = (cweConfig, event, context) => {
  // detect if it's an cwe-event at all:
  if (cweConfig.debug) {
    console.log('cwe:Event', JSON.stringify(event))
    console.log('cwe:context', context)
  }

  if (event && event["detail-type"] !== 'Scheduled Event') {
    console.log('Event does not look like a CloudWatch event')
    return null
  }

  for (const routeConfig of cweConfig.routes) {
    if (routeConfig.source instanceof RegExp) {
      if (routeConfig.source.test(event.source)) {
        const result = routeConfig.action(event, context)
        return result || {}
      }
    } else {
      if (routeConfig.source === event.source) {
        const result = routeConfig.action(event, context)
        return result || {}
      }
    }
  }

  if (cweConfig.debug) {
    console.log(`No source-match for ${event.source}`)
  }

  return null
}

/*
const cfgExample = {
    routes:[
        {
            source: /.*\/,
            action: (event, context) => console.log(event)
        }
    ]
};
*/


/* this is an example for a standard CloudWatch event message:

{
    "version": "0",
    "id": "53dc4d37-cffa-4f76-80c9-8b7d4a4d2eaa",
    "detail-type": "Scheduled Event",
    "source": "aws.events",
    "account": "123456789012",
    "time": "2015-10-08T16:53:06Z",
    "region": "us-east-1",
    "resources": [
        "arn:aws:events:us-east-1:123456789012:rule/my-scheduled-rule"
    ],
    "detail": {}
}

*/
