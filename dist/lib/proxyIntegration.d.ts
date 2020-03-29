import { APIGatewayEventRequestContext, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ProcessMethod } from './EventProcessor';
declare type ProxyIntegrationParams = {
    paths?: {
        [paramId: string]: string;
    };
};
declare type ProxyIntegrationBody<T = unknown> = {
    body: T;
};
export declare type ProxyIntegrationEvent<T = unknown> = Omit<APIGatewayProxyEvent, 'body'> & ProxyIntegrationParams & ProxyIntegrationBody<T>;
export declare type ProxyIntegrationResult = Omit<APIGatewayProxyResult, 'statusCode'> & {
    statusCode?: APIGatewayProxyResult['statusCode'];
};
export interface ProxyIntegrationRoute {
    path: string;
    method: string;
    action: (request: ProxyIntegrationEvent<unknown>, context: APIGatewayEventRequestContext) => ProxyIntegrationResult | Promise<ProxyIntegrationResult> | string | Promise<string>;
}
export declare type ProxyIntegrationErrorMapping = {
    [reason: string]: APIGatewayProxyResult['statusCode'];
};
export declare type ProxyIntegrationError = {
    statusCode: APIGatewayProxyResult['statusCode'];
    message: string;
} | {
    reason: string;
    message: string;
};
export interface ProxyIntegrationConfig {
    cors?: boolean;
    routes: ProxyIntegrationRoute[];
    debug?: boolean;
    errorMapping?: ProxyIntegrationErrorMapping;
    defaultHeaders?: APIGatewayProxyResult['headers'];
    proxyPath?: string;
}
export declare const process: ProcessMethod<ProxyIntegrationConfig, APIGatewayProxyEvent, APIGatewayEventRequestContext, APIGatewayProxyResult>;
export {};
