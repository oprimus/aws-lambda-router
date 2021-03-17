import { Context, ScheduledEvent } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';
export declare type CweEvent = ScheduledEvent;
export interface CweRoute {
    source: string | RegExp;
    action: (scheduledEvent: ScheduledEvent, context: Context) => Promise<any> | any;
}
export interface CweConfig {
    routes: CweRoute[];
    debug?: boolean;
}
export declare const process: ProcessMethod<CweConfig, CweEvent, Context, any>;
