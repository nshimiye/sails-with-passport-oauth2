/**
* @Author: mars
* @Date:   2016-12-07T23:33:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T23:06:33-05:00
*/

'use strict';

/**
 * ExternalService.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {

  attributes: {
    // start relationships
    users: {
      collection: 'User',
      via: 'externalServices'
    },
    rawList: {
      collection: 'RawData'
    },
    // end relationships

    serviceId: {
      type: 'string',
      required: true,
      unique: true
    },
    serviceType: { // GOOGLE, LINKEDIN, TWITTER
      type: 'string',
      required: true
    },
    active: { // \
      type: 'boolean',
      defaultsTo: true
    },
    token: { // google-<>, linkedin-<>, twitter-<>
      type: 'string',
      required: true
    },
    refreshToken: {
      type: 'string',
      required: false
    },

    displayName: {
      type: 'string',
      required: false
    },
    emails: { // [ ... ]
      type: 'json',
      required: false
    },

  }
};
