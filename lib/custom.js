"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const process = (customConfig, event, context) => {
    // detect if it's an cwe-event at all:
    if (customConfig.debug) {
        console.log('custom:Event', JSON.stringify(event));
        console.log('custom:context', context);
    }
    for (const routeConfig of customConfig.routes) {
        if (routeConfig.matcher(event, context)) {
            const result = routeConfig.action(event, context);
            return result || {};
        }
    }
    if (customConfig.debug) {
        console.log(`No custom-match for ${event.source}`);
    }
    return null;
};
exports.process = process;
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
