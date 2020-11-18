
/*
 * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

import { Method } from "axios";
import { HttpResponse } from "../models";
import { discoverBigip } from "./discover";
import { MetadataClient } from "./extension/metadata";
import { ManagementClient } from "./managementClient";

import localAtcMetadata from './atc_metadata.json';

export class F5Client {
    protected _mgmtClient: ManagementClient;
    protected _metadataClient: MetadataClient;
    protected _atcMetaData = localAtcMetadata;

    constructor(
        host: string,
        user: string,
        password: string,
        options?: {
            port?: number;
            provider?: string;
        }
    ) {
        this._mgmtClient = new ManagementClient(
            host,
            user,
            password,
            options ? options : undefined
        )
        // this._mgmtClient = mgmtClient;
        // this._metadataClient = metadataClient;
    }

    /**
     * Make HTTP request
     * 
     * @param uri     request URI
     * @param options function options
     * 
     * @returns request response
     */
    async https (uri: string, options?: {
        method?: Method;
        headers?: object;
        data?: object;
        contentType?: string;
        advancedReturn?: boolean;
    }): Promise<HttpResponse> { 
        return await this._mgmtClient.makeRequest(uri, options ? options : undefined)
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

        const x = await discoverBigip(this._atcMetaData, this._mgmtClient)

        return x;
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