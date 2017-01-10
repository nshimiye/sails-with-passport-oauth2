/**
* @Author: mars
* @Date:   2017-01-10T12:53:10-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-10T14:57:31-05:00
*/
// api/services/NetworkService.js
'use strict';
/**
 * provide methods to meka network requests
 */
 const requestInstance = require('request');

module.exports = {
  /**
   * this function only handles call that result in json responses
   * @param uri string
   * @param requestData { method, headers, body?, form? }
   */
  makeRequest(uri, requestData) {

    return new Promise((resolve, reject) => {

      let cleanRequestData = {
        uri,
        method: (requestData || {}).method,
        preambleCRLF: true,
        postambleCRLF: true,
        headers: (requestData || {}).headers
      };
      let method = cleanRequestData.method;
      let headers = cleanRequestData.headers;
      let request;
      if ((requestData || {}).body) {
        let body = requestData.body;
        cleanRequestData.body = body;
        request = body;
      } else if ((requestData || {}).form) {
        let form = requestData.form;
        cleanRequestData.form = form;
        request = form;
      }

      sails.log.debug(' ========================================== ');
      sails.log.debug(' [ makeRequest options ] ', cleanRequestData);
      sails.log.debug(' ========================================== ');

      let previousLogTime = Date.now();
      requestInstance(cleanRequestData, (error, response, body) => {
        // let networkServiceInstance = this;
              // clean log
              let latency = Date.now() - previousLogTime;
              sails.log.verbose({ uri, method, headers, request }, { error, body, latency }, { cleanRequestData, error, body });


              if (error || response.statusCode !== 200) {
                // BACKEND_API = value returned by a backend service
                sails.log.verbose('[makeRequest]', { origin: 'BACKEND_API', type: 'ERROR' }, error);
                // clean log
                sails.log.verbose({ origin: 'PASSPORT_OAUTH2_ERROR', message: { error }, level: 'error', timestamp: new Date(), tags: ['make-request'] });
                reject({ok: false, message: 'backend error', error: (error || response)} );

              } else {
                sails.log.verbose('[makeRequest]', { origin: 'BACKEND_API'}, response.request.uri, response.headers, body);
                sails.log.verbose('[makeRequest]', { origin: 'BACKEND_API'}, typeof body);

                sails.log.debug(' ========================================== ');
                sails.log.debug(' [ data from remote server ] ', typeof body);
                sails.log.debug(' ========================================== ');
                // @TODO since Satish's code is not done let's simulate it
                // for now, we call the discoverleads API
                var jsonContent;
                try  {
                  sails.log.warn('------  START NetworkService.makeRequest  ------');
                  sails.log.warn(uri, method, headers, request);
                  sails.log.warn(body && body.constructor);
                  sails.log.warn('------  END   NetworkService.makeRequest  ------');
                  jsonContent = JSON.parse(body || '{}');
                } catch(e){
                  jsonContent = {};
                  // clean log
                  sails.log.verbose({ origin: 'PASSPORT_OAUTH2_ERROR', message: { error }, level: 'error', timestamp: new Date(), tags: ['make-request'] });
                  sails.log.error('[makeRequest]', { origin: 'BACKEND_API', type: 'ERROR' }, e);
                  return reject({ok: false, message: 'unable to parse response', error: e});
                }
                sails.log.debug('========== START makeRequest callback========== ');
                sails.log.debug(jsonContent);
                sails.log.debug('========== END makeRequest callback  ========== ');

                resolve(jsonContent);

              }
        });

      });

    }
};
