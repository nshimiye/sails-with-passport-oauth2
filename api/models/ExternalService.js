/**
* @Author: mars
* @Date:   2016-12-07T23:33:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-09T11:46:36-05:00
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
    active: { // there is no delete, just hide and show
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
    identification: { // emails, usernames, phonenumbers => [ ... ]
      type: 'json',
      required: false
    },
    // we may need different pieces on information
    // depending on what service we are using
    // meta is a place for storing service specific info
    meta: {
      type: 'json'
    }
  }
};
