"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const NO_MATCHING_ACTION = (request) => {
    throw {
        reason: 'NO_MATCHING_ACTION',
        message: `Could not find matching action for ${request.path} and method ${request.httpMethod}`
    };
};
const addCorsHeaders = (toAdd = {}) => {
    toAdd['Access-Control-Allow-Origin'] = '*';
    toAdd['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,HEAD,PATCH';
    toAdd['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token';
    return toAdd;
};
const processActionAndReturn = async (actionConfig, event, context, headers) => {
    const res = await actionConfig.action(event, context);
    if (!res || typeof res !== 'object' || typeof res.body !== 'string') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res) || '{}'
        };
    }
    return Object.assign(Object.assign({ statusCode: 200 }, res), { headers: Object.assign(Object.assign({}, headers), res.headers) });
};
const process = (proxyIntegrationConfig, event, context) => {
    if (proxyIntegrationConfig.debug) {
        console.log('Lambda proxyIntegrationConfig: ', proxyIntegrationConfig);
        console.log('Lambda event: ', event);
        console.log('Lambda context: ', context);
    }
    //validate config
    if (!Array.isArray(proxyIntegrationConfig.routes) || proxyIntegrationConfig.routes.length < 1) {
        throw new Error('proxyIntegration.routes must not be empty');
    }
    // detect if it's an http-call at all:
    if (!event.httpMethod || !event.path) {
        return null;
    }
    const headers = {};
    if (proxyIntegrationConfig.cors) {
        addCorsHeaders(headers);
        if (event.httpMethod === 'OPTIONS') {
            return Promise.resolve({
                statusCode: 200,
                headers,
                body: ''
            });
        }
    }
    Object.assign(headers, { 'Content-Type': 'application/json' }, proxyIntegrationConfig.defaultHeaders);
    // assure necessary values have sane defaults:
    const errorMapping = proxyIntegrationConfig.errorMapping || {};
    errorMapping['NO_MATCHING_ACTION'] = 404;
    if (proxyIntegrationConfig.proxyPath) {
        event.path = (event.pathParameters || {})[proxyIntegrationConfig.proxyPath] || '';
        if (proxyIntegrationConfig.debug) {
            console.log(`proxy path is set: ${proxyIntegrationConfig.proxyPath}`);
            console.log(`proxy path with event path: ${event.path}`);
        }
    }
    else {
        event.path = normalizeRequestPath(event);
    }
    try {
        const actionConfig = findMatchingActionConfig(event.httpMethod, event.path, proxyIntegrationConfig) || {
            action: NO_MATCHING_ACTION,
            paths: undefined
        };
        const proxyEvent = event;
        proxyEvent.paths = actionConfig.paths;
        if (event.body) {
            try {
                proxyEvent.body = JSON.parse(event.body);
            }
            catch (parseError) {
                console.log(`Could not parse body as json: ${event.body}`, parseError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'body is not a valid JSON', error: 'ParseError' })
                };
            }
        }
        return processActionAndReturn(actionConfig, proxyEvent, context, headers).catch(error => {
            console.log('Error while handling action function.', error);
            return convertError(error, errorMapping, headers);
        });
    }
    catch (error) {
        console.log('Error while evaluating matching action handler', error);
        return convertError(error, errorMapping, headers);
    }
};
exports.process = process;
const normalizeRequestPath = (event) => {
    if (isLocalExecution(event)) {
        return event.path;
    }
    // ugly hack: if host is from API-Gateway 'Custom Domain Name Mapping', then event.path has the value '/basepath/resource-path/'
    // if host is from amazonaws.com, then event.path is just '/resource-path':
    const apiId = event.requestContext ? event.requestContext.apiId : null; // the apiId that is the first part of the amazonaws.com-host
    if ((apiId && event.headers && event.headers.Host && event.headers.Host.substring(0, apiId.length) !== apiId)) {
        // remove first path element:
        const groups = /\/[^\/]+(.*)/.exec(event.path) || [null, null];
        return groups[1] || '/';
    }
    return event.path;
};
const hasReason = (error) => typeof error.reason === 'string';
const hasStatus = (error) => typeof error.statusCode === 'number';
const convertError = (error, errorMapping, headers) => {
    if (hasReason(error) && errorMapping && errorMapping[error.reason]) {
        return {
            statusCode: errorMapping[error.reason],
            body: JSON.stringify({ message: error.message, error: error.reason }),
            headers
        };
    }
    else if (hasStatus(error)) {
        return {
            statusCode: error.statusCode,
            body: JSON.stringify({ message: error.message, error: error.statusCode }),
            headers: addCorsHeaders({})
        };
    }
    try {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'ServerError', message: `Generic error:${JSON.stringify(error)}` }),
            headers: addCorsHeaders({})
        };
    }
    catch (stringifyError) { }
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'ServerError', message: 'Generic error' })
    };
};
const findMatchingActionConfig = (httpMethod, httpPath, routeConfig) => {
    const paths = {};
    const matchingMethodRoutes = routeConfig.routes.filter(route => route.method === httpMethod);
    for (const route of matchingMethodRoutes) {
        if (routeConfig.debug) {
            console.log(`Examining route ${route.path} to match ${httpPath}`);
        }
        const pathPartNames = extractPathNames(route.path);
        const pathValues = extractPathValues(route.path, httpPath);
        if (pathValues && pathPartNames) {
            for (let ii = 0; ii < pathValues.length; ii++) {
                paths[pathPartNames[ii]] = decodeURIComponent(pathValues[ii]);
            }
            if (routeConfig.debug) {
                console.log(`Found matching route ${route.path} with paths`, paths);
            }
            return {
                action: route.action,
                paths
            };
        }
    }
    if (routeConfig.debug) {
        console.log(`No match for ${httpPath}`);
    }
    return null;
};
const extractPathValues = (pathExpression, httpPath) => {
    const pathExpressionPattern = pathExpression.replace(/{[\w]+}|:[\w]+/g, '([^/]+)');
    const pathValueRegex = new RegExp(`^${pathExpressionPattern}$`);
    const pathValues = pathValueRegex.exec(httpPath);
    return pathValues && pathValues.length > 0 ? pathValues.slice(1) : null;
};
const extractPathNames = (pathExpression) => {
    const pathExpressionPattern = pathExpression.replace(/{[\w.]+}|:[\w.]+/g, '[:{]([\\w]+)}?');
    const pathNameRegex = new RegExp(`^${pathExpressionPattern}$`);
    const pathNames = pathNameRegex.exec(pathExpression);
    return pathNames && pathNames.length > 0 ? pathNames.slice(1) : null;
};
const isLocalExecution = (event) => {
    return event.headers
        && event.headers.Host
        && (event.headers.Host.startsWith('localhost') || event.headers.Host.startsWith('127.0.0.1'));
};
