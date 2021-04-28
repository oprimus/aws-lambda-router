import { Context } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';

export type CustomEvent = any

export interface CustomRoute {
  matcher: (customEvent: CustomEvent, context: Context) => boolean;
  action: (customEvent: CustomEvent, context: Context) => Promise<any> | any
}

export interface CustomConfig {
  routes: CustomRoute[];
  debug?: boolean;
}

export const process: ProcessMethod<CustomConfig, CustomEvent, Context, any> = (customConfig, event, context) => {
  // detect if it's an cwe-event at all:
  if (customConfig.debug) {
    console.log('custom:Event', JSON.stringify(event))
    console.log('custom:context', context)
  }

  for (const routeConfig of customConfig.routes) {
    if (routeConfig.matcher(event, context)) {
      const result = routeConfig.action(event, context);
      return result || {}
    }
  }

  if (customConfig.debug) {
    console.log(`No custom-match for ${event.source}`)
  }

  return null
}

/*
const cfgExample = {
    routes:[
        {
            matcher: (event, context) => true                // Matches anything
            action: (event, context) => console.log(event)   // Just log event to console
        }
    ]
};
*/
