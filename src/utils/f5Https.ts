/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import * as fs from 'fs';
import https from 'https';
import axios, { Method, AxiosResponse, AxiosBasicCredentials } from 'axios';
import timer, { IncomingMessageWithTimings } from '@szmarczak/http-timer/dist/source';
import Logger from '../logger';
import * as miscUtils from './misc';
import assert from 'assert';

import { HttpResponse } from '../models'
import { ClientRequest } from 'http';
import { allowedNodeEnvironmentFlags } from 'process';
import path from 'path';

const logger = Logger.getLogger();

/**
 * Used to inject http call timers
 * transport:request: httpsWithTimer
 */
const transport = {
    request: function httpsWithTimer(...args: unknown[]): ClientRequest {
        const request = https.request.apply(null, args)
        timer(request);
        return request;
    }
};

/**
 * Make generic HTTP request
 * 
 * @param host    host where request should be made
 * @param uri     request uri
 * @param options function options
 * 
 * @returns response data
 */
export async function makeRequest(host: string, uri: string, options?: {
    method?: Method;
    port?: number | 443;
    data?: unknown;
    headers?: unknown;
    basicAuth?: AxiosBasicCredentials;
    advancedReturn?: boolean;
}): Promise<HttpResponse> {
    // options = options || {};

    logger.debug(`Making HTTP request: ${host} ${uri} ${miscUtils.stringify(options)}`);

    let httpResponse: HttpResponse;

    //  have to keep adding the type definition for "transport" to axios when upgrading versions
    //  it's allowed in the config, just missing in the types:
    //  https://github.com/axios/axios/blob/master/lib/adapters/http.js#L163
    //  https://github.com/axios/axios/issues/2853


    // wrapped in a try for debugging
    try {
        httpResponse = await axios.request({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            method: options?.method ? options.method : 'GET',
            baseURL: `https://${host}:${options?.port ? options?.port : 443}`,
            url: uri,
            headers: options?.headers ? options?.headers : {},
            data: options?.data ? options.data : null,
            // auth: options['basicAuth'] !== undefined ? {
            //     username: options['basicAuth']['user'],
            //     password: options['basicAuth']['password']
            // } : null,
            transport,
            validateStatus: null     // no need to set this if we aren't using it right now...
        })
    } catch (err) {
        console.log(err);
    }

    // not sure what the use case is for on the following "advanced return"
    // withProgress might be a better solution if we are just looking for feedback on long
    // running requests

    // check for advanced return
    if (options?.advancedReturn) {
        return {
            data: httpResponse.data,
            status: httpResponse.status
        }
    }

    // check for unsuccessful request
    if (httpResponse.status > 300) {
        return Promise.reject(new Error(
            `HTTP request failed: ${httpResponse.status} ${miscUtils.stringify(httpResponse.data)}`
        ));
    }
    // return response data
    return {
        data: httpResponse.data,
        headers: httpResponse.headers,
        status: httpResponse.status,
        statusText: httpResponse.statusText,
        request: {
            url: httpResponse.config.url,
            method: httpResponse.request.method,
            headers: httpResponse.request.headers,
            protocol: httpResponse.config.httpsAgent.protocol,
            timings: httpResponse.request.timings,
            // data: httpResponse.data
        }
    };
}

/**
 * Download HTTP payload to file
 *
 * @param url  url
 * @param file local file location where the downloaded contents should go
 *
 * @returns void
 */
export async function downloadToFile(fileName: string, localDestPath: string, host: string, port: number, token: string): Promise<HttpResponse> {

    //  host: string, port: number, token: string

    const writable = fs.createWriteStream(localDestPath)

    return new Promise(((resolve, reject) => {
        makeRequest(
            host,
            `/mgmt/cm/autodeploy/software-image-downloads/${fileName}`,
            {
                port,
                headers: {
                    'X-F5-Auth-Token': token,
                }
            })
            .then(function (response) {
                response.data.pipe(writable)
                    .on('finish', () => {
                        return resolve({
                            data: {
                                path: writable.path,
                                bytes: writable.bytesWritten
                            },
                            headers: response.headers,
                            status: response.status,
                            statusText: response.statusText,
                            request: {
                                url: response.config.url,
                                method: response.request.method,
                                headers: response.request.headers,
                                protocol: response.config.httpsAgent.protocol,
                                timings: response.request.timings
                            }
                        })
                    });
            })
            .catch(err => {
                // look at adding more failure details, like,
                // was it tcp, dns, dest url problem, write file problem, ...
                return reject(err)
            })
    }));
}





/**
 * upload file to f5
 *  - POST	/mgmt/shared/file-transfer/uploads/{file}
 *  - path on f5 -> /var/config/rest/downloads
 *
 * @param file local file location to upload
 * @param host
 * @param port
 * @param token
 *
 * @returns void
 */
export async function uploadFile(file: string, host: string, port: number, token: string) {

    let response;
    const fileName = path.parse(file).base;

    const fileStats = fs.statSync(file);
    const chunkSize = 1024 * 1024;
    let start = 0;
    let end = Math.min(chunkSize, fileStats.size - 1);
    while (end <= fileStats.size - 1 && start < end) {

        response = await makeRequest(
            host,
            `/mgmt/shared/file-transfer/uploads/${fileName}`,
            {
                port,
                method: 'POST',
                headers: {
                    'X-F5-Auth-Token': token,
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `${start}-${end}/${fileStats.size}`,
                    'Content-Length': end - start + 1
                },
                data: fs.createReadStream(file, { start, end }),
                // contentType: 'raw'
            }
        );

        start += chunkSize;
        if (end + chunkSize < fileStats.size - 1) { // more to go
            end += chunkSize;
        } else if (end + chunkSize > fileStats.size - 1) { // last chunk
            end = fileStats.size - 1;
        } else { // done - could use do..while loop instead of this
            end = fileStats.size;
        }
    }

    return {
        data: {
            fileName,
            bytes: fileStats.size
        },
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        request: {
            url: response.request.url,
            method: response.request.method,
            headers: response.request.headers,
            protocol: response.request.protocol,
            timings: response.request.timings
        }
    }

}



/////// the following doesn't seem to be used
/**
 * Parse URL
 *
 * @param url  url
 *
 * @returns parsed url properties
 */
export function parseUrl(url: string): {
    host: string;
    path: string;
} {
    // exmple of using the following URL interface for parsing URLs
    const b = new URL(url);
    const c = {
        host: b.host,
        path: b.pathname
    }

    const x = {
        host: url.split('://')[1].split('/')[0],
        path: `/${url.split('://')[1].split('/').slice(1).join('/')}`
    }

    assert.deepStrictEqual(x, c, 'should be equal');
    return x;
}