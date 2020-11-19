
// /*
//  * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
//  * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
//  * may copy and modify this software product for its internal business purposes.
//  * Further, Licensee may upload, publish and distribute the modified version of
//  * the software product on devcentral.f5.com.
//  */

// 'use strict';

// import { MetadataClient } from "./extension/metadata";
// import { ManagementClient } from "./managementClient";

// /**
//  * side fuction to discover details about connected device
//  *  - host-info/platform/license (bigip vs bigiq)
//  *  - fast/as3/do/ts
//  */
// export async function discoverBigip (atcMetaData, device: ManagementClient ) {

//     // let discover = {
//     //     host
//     // }

//     //  f5 host info api:   '/mgmt/shared/identified-devices/config/device-info'
//     //  fast info api:      '/mgmt/shared/fast/info'
//     //  as3 info api:       '/mgmt/shared/appsvcs/info'
//     //  do info api:        '/mgmt/shared/declarative-onboarding/info'
//     //  ts info api:        '/mgmt/shared/telemetry/info'

//     const host = await device.makeRequest('/mgmt/shared/identified-devices/config/device-info');

//     const fatc = atcMetaData;
//     const fast = await device.makeRequest('/mgmt/shared/fast/info');
//     const as3 = await device.makeRequest('/mgmt/shared/appsvcs/info');

//     const y = '';
//     return 'discovered stuff';
// }