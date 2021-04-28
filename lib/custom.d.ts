import { Context } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';
export declare type CustomEvent = any;
export interface CustomRoute {
    matcher: (customEvent: CustomEvent, context: Context) => boolean;
    action: (customEvent: CustomEvent, context: Context) => Promise<any> | any;
}
export interface CustomConfig {
    routes: CustomRoute[];
    debug?: boolean;
}
export declare const process: ProcessMethod<CustomConfig, CustomEvent, Context, any>;
