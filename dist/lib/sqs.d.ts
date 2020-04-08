import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';
export declare type SqsEvent = SQSEvent;
export interface SqsRoute {
    source: string | RegExp;
    action: (messages: SQSRecord['body'][] | SQSRecord[], context: Context) => Promise<any> | any;
    messageBodyOnly?: boolean;
}
export interface SqsConfig {
    routes: SqsRoute[];
    debug?: boolean;
}
export declare const process: ProcessMethod<SqsConfig, SqsEvent, Context, any>;
