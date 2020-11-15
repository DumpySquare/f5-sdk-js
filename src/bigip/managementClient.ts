/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import * as httpUtils from '../utils/http';
import { HttpResponse, Token } from '../models'
import { Method } from 'axios';



//  * Basic Example:
//  * 
//  * ```
//  * const mgmtClient = new ManagementClient({
//  *      host: '192.0.2.1',
//  *      port: 443,
//  *      user: 'admin',
//  *      password: 'admin'
//  * });
//  * await mgmtClient.login();
//  * await mgmtClient.makeRequest('/mgmt/tm/sys/version');
//  * ```

/**
 *  Base bigip connectivity client
 * 
 * @param host
 * @param port
 * @param user
 * @param options.password
 * @param options.provider
 * 
 */
export class ManagementClient {
    host: string;
    port: number;
    protected _user: string;
    protected _password: string;
    protected _provider: string;
    protected _token: Token;
    protected _tokenTimeout: number;
    protected _tokenIntervalId: NodeJS.Timeout;

    /**
     * @param options function options
     */
    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number;
            provider?: string;
        }
    ) {
        this.host = host;
        this._user = user;
        this._password = password;
        this.port = options?.port || 443;
        this._provider = options?.provider || 'local';
    }





    /**
     * clear auth token and timer
     *  - used for logging out/disconnecting, and testing
     */
    async clearToken (): Promise<void> {
        clearInterval(this._tokenIntervalId);
        return this._token = undefined;
    }


    


    /**
     * sets/gets/refreshes auth token
     */
    private async getToken(): Promise<void> {

        // logger.debug('getting auth token from: ', `${this.host}:${this.port}`);

        const resp = await httpUtils.makeRequest(
            this.host,
            '/mgmt/shared/authn/login',
            {
                method: 'POST',
                port: this.port,
                data: {
                    username: this._user,
                    password: this._password,
                    loginProviderName: this._provider
                }
            }
        );

        // capture entire token
        this._token = resp.data['token'];
        // set token timeout for timer
        this._tokenTimeout = this._token.timeout;

        this.tokenTimer();  // start token timer
    }





    /**
     * bigip auth token lifetime countdown
     * will clear auth token details when finished
     * prompting the next http call to get a new token
     */
    private async tokenTimer(): Promise<void> {

        this._tokenIntervalId = setInterval(() => {
            this._tokenTimeout--;
            if (this._tokenTimeout <= 0) {
                clearInterval(this._tokenIntervalId);
                this._token = undefined; // clearing token details should get a new token
                console.log('authToken expired', this._tokenTimeout);
            }
        // run timer a little fast to pre-empt update
        }, 999);
    }




    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options function options
     * 
     * @returns request response
     */
    async makeRequest(uri: string, options?: {
        method?: Method;
        headers?: object;
        data?: object;
        contentType?: string;
        advancedReturn?: boolean;
    }): Promise<HttpResponse> {
        options = options || {};

        // if auth token has expired, it should have been cleared, get new one
        if(!this._token){
            await this.getToken();
        }

        // todo: add logic to watch for failed/broken tokens, clear token when needed
        // be able to clear the token if it expires before timer

        return await httpUtils.makeRequest(
            this.host,
            uri,
            {
                method: options?.method || undefined,
                port: this.port,
                headers: Object.assign(options?.headers || {}, {
                    'X-F5-Auth-Token': this._token
                }),
                data: options?.data || undefined,
                advancedReturn: options?.advancedReturn || false
            }
        );
    }

    /**
     * discover information about device
     *  - bigip/bigiq/nginx
     *  - tmos/nginx version
     *  - installed atc services and versions
     *  
     */
    async discover() {
        // try tmos info endpoint
        // try fast info endpoint
        // try as3 info endpoint
        // try do info endpoint
        // try ts info endpoint
        // try cf info endpoint

        // return object of discovered services
    }
    
    /**
     * upload file to f5
     *  - used for ucs/ilx-rpms/.conf-merges
     * @param localSourcePathFilename 
     */
    async uploadFile (localSourcePathFilename: string) { 

        return {
            destFilePath: '/path/file.x',
            sizeBytes: '74523'
        }
    }
    

    /**
     * download file from f5 (ucs/qkview/...)
     *  - there are only a couple of directories accessible via api
     *      need to document them and pick a default so the other functions
     *      can put thier output files in the same place
     * @param localDestPathFile 
     */
    async downloadFile (localDestPath: string) {

        return;
    }
    
    /**
     * generate and download ucs file
     *  - should include all parameters for creating ucs
     * @param localDestPathFile 
     * @param options.passPhrase to encrypt ucs with
     * @param options.noPrivateKey exclude SSL private keys from regular ucs
     * @param options.mini create mini_ucs for corkscrew
     */
    async getUCS (
        localDestPathFile: string, 
        options?: { 
            passPhrase?: string;
            noPrivateKey?: boolean;
            mini?: boolean; 
        }): Promise<object> {

            // K13132: Backing up and restoring BIG-IP configuration files with a UCS archive
            // https://support.f5.com/csp/article/K13132
            // tmsh save sys ucs $(echo $HOSTNAME | cut -d'.' -f1)-$(date +%H%M-%m%d%y)

        return {
            localDestPathFileName: '/path/file.ucs',
            sizeBytes: '1234'
        };
    };

    /**
     * generate and download qkview
     *  - should include all parameters for creating a qkview
     *  - should probably default to silent with lowest priority
     * @param localDestPathFile 
     * @param options 
     */
    async getQkview(
        localDestPathFile: string, 
        options?: {
            excludeCoreFiles: boolean;
        }): Promise<unknown> {

        return {
            localDestPathFileName: '/path/file.qkview',
            sizeBytes2: '4567'
        };
    }

    /**
     * install specified ilx-rpm
     *  - need to discuss workflow
     *  - should this just install an rpm already uploaded?
     *  - or should this also fetch/upload the requested rpm?
     */
    async installRPM(rpmName: string) {
        
        return;
    }


    async getMetaData () {

        return;
    }
}