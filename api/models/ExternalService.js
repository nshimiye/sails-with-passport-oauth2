/**
* @Author: mars
* @Date:   2016-12-07T23:33:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T02:10:42-05:00
*/

'use strict';

/**
 * ExternalService.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    serviceId: {
      type: 'string',
      required: true,
      unique: true
    },
    serviceType: { // GOOGLE, LINKEDIN, TWITTER
      type: 'string',
      required: true
    },

    token: { // GOOGLE, LINKEDIN, TWITTER
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

    users: {
      collection: 'User',
      'via': 'externalServices'
    },

    raw : { type: 'json' }
  }
};
