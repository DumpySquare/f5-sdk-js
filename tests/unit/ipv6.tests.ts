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

import assert from 'assert';
import nock from 'nock';
import { ManagementClient } from '../../src/bigip';
import { F5Client } from '../../src/bigip/f5Client';
import { 
    as3InfoApiReponse, 
    deviceInfo, 
    doInfoApiReponse, 
    fastInfoApiResponse 
} from '../artifacts/f5_device_atc_infos';

import { getManagementClientIpv6, ipv6Host } from './bigip/fixtureUtils';
// import { requestNew } from '../../src/utils/http_new'
// import { makeRequest } from '../../src/utils/http';
import { getFakeToken } from './bigip/fixtureUtils';
import localAtcMetadata from '../../src/bigip/atc_metadata.json';






describe('http client tests - ipv6', function () {
    let mgmtClient: ManagementClient;

    // beforeEach(function () {
    //     mgmtClient = getManagementClientIpv6();
    // });
    // afterEach(function () {
    //     if (!nock.isDone()) {
    //         throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
    //     }
    //     nock.cleanAll();
    // });

    it('should make basic request', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, getFakeToken())
            .get('/foo')
            .reply(200, { foo: 'bar' });

        
        mgmtClient = getManagementClientIpv6();

        const response = await mgmtClient.makeRequest('/foo');
        assert.deepStrictEqual(response.data, { foo: 'bar' })
        await mgmtClient.clearToken();
    });

    it('should make basic request - additional mgmt client params', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, getFakeToken())
            .get('/foo')
            .reply(200, { foo: 'bar' });

        // create a custom mgmtClient so we can inject/test port/provider
        mgmtClient = new ManagementClient(
            ipv6Host,
            'admin',
            'admin',
            {
                port: 8443,
                provider: 'tmos'
            }
        )

        const response = await mgmtClient.makeRequest('/foo');
        assert.deepStrictEqual(response.data, { foo: 'bar' })
        await mgmtClient.clearToken();
    });


    it('extending ipv6 - discovery', async function () {
        nock(`https://${ipv6Host}:8443`)
            .post('/mgmt/shared/authn/login')
            .reply(200, getFakeToken())

            .get('/foo')
            .reply(200, { foo: 'bar' })

            .get('/mgmt/shared/identified-devices/config/device-info')
            .reply(200, deviceInfo)

            .get(localAtcMetadata.components.fast.endpoints.info.uri)
            .reply(200, fastInfoApiResponse)
            
            .get(localAtcMetadata.components.as3.endpoints.info.uri)
            .reply(200, as3InfoApiReponse)

            .get(localAtcMetadata.components.do.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

            .get(localAtcMetadata.components.ts.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

            .get(localAtcMetadata.components.cf.endpoints.info.uri)
            .reply(200, doInfoApiReponse)

        // create a custom mgmtClient so we can inject/test port/provider
        const dClient = new F5Client(
            ipv6Host,
            'admin',
            'admin',
            {
                port: 8443,
                provider: 'tmos'
            }
        )

        // const x = await mgmtClient.discover();
        const resp = await dClient.https('/foo');
        const disc = await dClient.discover();
        // await dClient.getQkview();
        assert.deepStrictEqual(resp.data, { foo: 'bar' })
        await dClient.clearLogin();
    });
});