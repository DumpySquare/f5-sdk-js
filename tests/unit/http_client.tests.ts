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

import { getManagementClient, defaultHost } from './bigip/fixtureUtils';
// import { requestNew } from '../../src/utils/http_new'
import { makeRequest } from '../../src/utils/http';


describe('http client tests', function () {
    let mgmtClient;

    beforeEach(function() {
        mgmtClient = getManagementClient();
    });
    afterEach(function() {
        if(!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`)
        }
        nock.cleanAll();
    });

    it('should login', async function() {
        nock(`https://${defaultHost}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, { token: { 'token': '1234' } });

        const x = await mgmtClient.login();

        const y = x;
    });

    it('should make request', async function() {
        nock(`https://${defaultHost}`)
            .post('/mgmt/shared/authn/login')
            .reply(200, { token: { 'token': '1234' } })
            .get('/foo')
            .reply(200, { foo: 'bar' });

        await mgmtClient.login();
        const response = await mgmtClient.makeRequest('/foo');
        assert.deepStrictEqual(response.data, { foo: 'bar' })
    });
});