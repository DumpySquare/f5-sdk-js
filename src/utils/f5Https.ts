
// /*
//  * Copyright 2020. F5 Networks, Inc. See End User License Agreement ("EULA") for
//  * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
//  * may copy and modify this software product for its internal business purposes.
//  * Further, Licensee may upload, publish and distribute the modified version of
//  * the software product on devcentral.f5.com.
//  */

// 'use strict';

// import { Method } from "axios";
// import { HttpResponse } from "../models";
// import * as httpUtils from '../utils/http';





// // /**
// //  * These utils build on the /utils/http.ts for F5 specific calls
// //  */




// /**
//  * sets/gets/refreshes auth token
//  */
// export async function getF5Token(host: string, port: number, user: string, password: string, provider: string): Promise<HttpResponse> {

//     // logger.debug('getting auth token from: ', `${this.host}:${this.port}`);
//     // const ttt = gThis;

//     // const rrr = gThis.makeRequest()

//     return await httpUtils.makeRequest(
//         this.host,
//         '/mgmt/shared/authn/login',
//         {
//             method: 'POST',
//             port: this.port,
//             data: {
//                 username: this._user,
//                 password: this._password,
//                 loginProviderName: this._provider
//             }
//         }
//     );

//     // // capture entire token
//     // this._token = resp.data['token'];
//     // // set token timeout for timer
//     // this._tokenTimeout = this._token.timeout;

//     // this.tokenTimer();  // start token timer
// }


// /**
//  * Make HTTP request
//  * 
//  * @param uri     request URI
//  * @param options function options
//  * 
//  * @returns request response
//  */
// export async function makeF5Request(uri: string, host: string, options?: {
//     method?: Method;
//     headers?: object;
//     data?: object;
//     contentType?: string;
//     advancedReturn?: boolean;
// }): Promise<HttpResponse> {
//     options = options || {};

//     // // if auth token has expired, it should have been cleared, get new one
//     // if(!this._token){
//     //     await this.getToken();
//     // }

//     // todo: add logic to watch for failed/broken tokens, clear token when needed
//     // be able to clear the token if it expires before timer

//     return await httpUtils.makeRequest(
//         host,
//         uri,
//         {
//             headers: Object.assign(options?.headers || {}, {
//                 'X-F5-Auth-Token': this._token
//             }),
//         }
//     );
// }


