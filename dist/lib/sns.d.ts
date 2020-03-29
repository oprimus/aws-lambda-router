import { Context, SNSEvent, SNSMessage } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';
export declare type SnsEvent = SNSEvent;
export interface SnsRoute {
    subject: RegExp;
    action: (sns: SNSMessage, context: Context) => Promise<any> | any;
}
export interface SnsConfig {
    routes: SnsRoute[];
    debug?: boolean;
}
export declare const process: ProcessMethod<SnsConfig, SnsEvent, Context, any>;
