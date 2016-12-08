/**
* @Author: mars
* @Date:   2016-12-07T17:35:44-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-07T21:53:18-05:00
*/

'use strict';

// api/services/UtilityService.js
module.exports = {
  Model(modelInstance) {
    let US = this;
    return {
        US,
        modelInstance,
        create (attributes) {
          // User.findOne(attributes).populate('dailyJokes')
          // this.modelInstance.findOne(attributes).populate('dailyJokes')
            return this.US.runDBQuery(this.modelInstance.create(attributes));
            // return promisify(this.model.create)(attributes);
        },

        findOne: function (criteria) {
          return this.US.runDBQuery(this.modelInstance.findOne(criteria));
            // return promisify(this.model.findOne)(criteria);
        },

        findOrCreate: function (criteria, attributes) {
          return this.US.runDBQuery(this.modelInstance.findOrCreate(criteria, attributes));
            // return promisify(this.model.findOrCreate)(criteria, attributes);
        },


        update (criteria, attributes) {
          return this.US.runDBQuery(this.modelInstance.update(criteria, attributes));
            // return promisify(this.model.update)(criteria, attributes);
        },

        destroy (criteria) {
          return this.US.runDBQuery(this.modelInstance.destroy(criteria));
        }
    };
  },
  runDBQuery(query) {
    return new Promise((resolve, reject) => {
      query.exec(
        function(e, result){
          if(e) {
            return reject(e);
          }
          return resolve(result);
        });

    });
  }
};
