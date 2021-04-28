import { ProxyIntegrationConfig, ProxyIntegrationEvent } from './lib/proxyIntegration';
import { SnsConfig, SnsEvent } from './lib/sns';
import { SqsConfig, SqsEvent } from './lib/sqs';
import { S3Config, S3Event } from './lib/s3';
import { CweConfig, CweEvent } from './lib/cwe';
import { CustomConfig, CustomEvent } from './lib/custom';
import { Context } from 'aws-lambda';
export interface RouteConfig {
    proxyIntegration?: ProxyIntegrationConfig;
    sns?: SnsConfig;
    sqs?: SqsConfig;
    s3?: S3Config;
    cwe?: CweConfig;
    custom?: CustomConfig;
    debug?: boolean;
}
export declare type RouterEvent = ProxyIntegrationEvent | SnsEvent | SqsEvent | S3Event | CweEvent | CustomEvent;
export declare const handler: (routeConfig: RouteConfig) => <TContext extends Context>(event: RouterEvent, context: TContext) => Promise<any>;
