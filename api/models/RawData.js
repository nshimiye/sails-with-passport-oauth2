/**
* @Author: mars
* @Date:   2016-12-08T20:11:05-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T20:19:32-05:00
*/

/**
 * RawData.js
 *
 * @description :: connecting an external service (signup or add to existing account)
 *                 involves extraction of partial info (userful to the main system)
 *                 however, external service may send more important data that
 *                 we don't need right away. So we store this as rowData
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {

  attributes: {

    current : {
      type: 'boolean'
    },

    content : {
      type: 'json'
    },

    // relationships


  }
};
