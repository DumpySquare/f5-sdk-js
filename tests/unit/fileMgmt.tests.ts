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
import * as fs from 'fs';


import { getManagementClientIpv6, ipv6Host } from './bigip/fixtureUtils';
// import { requestNew } from '../../src/utils/http_new'
// import { makeRequest } from '../../src/utils/http';
import { getFakeToken } from './bigip/fixtureUtils';
// import localAtcMetadata from '../../src/bigip/atc_metadata.json';
import path from 'path';



describe('file upload/download tests - ipv6', function () {
    let mgmtClient: ManagementClient;


    const rpm = 'f5-appsvcs-templates-1.4.0-1.noarch.rpm';
    const tmp = path.join(__dirname, '..', 'tmp', rpm)
    const filePath = path.join(__dirname, '..', 'artifacts', rpm)

    beforeEach(function () {
        mgmtClient = getManagementClientIpv6();
    });
    afterEach(function () {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        nock.cleanAll();
    });

    it('download file from F5', async function () {
        nock(`https://${ipv6Host}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, getFakeToken())

            .get(`/mgmt/cm/autodeploy/software-image-downloads/${rpm}`)
            .replyWithFile(200, filePath);

        const resp = await mgmtClient.downloadFile(rpm, tmp);   // download file

        assert.ok(fs.existsSync(resp.data.path))                // confirm/assert file is there

        fs.unlinkSync(resp.data.path);                          // remove tmp file
        await mgmtClient.clearToken();                          // clear auth token for next test
    });


    // it('upload file to ', async function () {
    //     nock(`https://${ipv6Host}:8443`)
    //         .post('/mgmt/shared/authn/login')
    //         .reply(200, getFakeToken())
    //         .get(`/mgmt/cm/autodeploy/software-image-downloads/${file}`)
    //         .reply(200, { foo: 'bar' });


    //     // mgmtClient = getManagementClientIpv6();

    //     const response = await mgmtClient.makeRequest('/foo');
    //     assert.deepStrictEqual(response.data, { foo: 'bar' })
    //     await mgmtClient.clearToken();
    // });

});