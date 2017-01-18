/**
* @Author: mars
* @Date:   2016-12-12T13:34:33-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-18T15:22:17-05:00
*/
/**
 EFS
 - PROD: http://52.7.123.186
 - DEV: 54.174.27.160
 - AWON: 172.17.2.53
 * config/externalServices.js
 * each object is bound to the service data (as api) during execution
 */
let externalServices = {

  'slack': {
    SLACK_TEAM_INFO_API: 'https://slack.com/api/team.info',
    SLACK_USERS_INFO_API: 'https://slack.com/api/users.info',
    SLACK_IM_LIST_API: 'https://slack.com/api/im.list', // DIRECT_CHANNELS
    SLACK_CHANNELS_LIST_API: 'https://slack.com/api/channels.list',
    SLACK_AUTH_TEST: 'https://slack.com/api/auth.test',
    REVOKE_TOKEN_API: 'https://slack.com/api/auth.revoke',
    template: {
      logoUrl: '/assets/images/slack.png',
      name: 'Slack',
      description: 'Connect your slack account with SAM to keep updated with your emails.',
      newButton: '<img src="/assets/images/slack.png" alt="slack-image"> Add to Slack',
      existingButton: 'Dashboard'
    }
  },
  'google': {
    REVOKE_TOKEN_API: 'https://accounts.google.com/o/oauth2/revoke',
    template: {
      logoUrl: '/assets/images/google.png',
      name: 'Google',
      description: 'Google data analytics',
      newButton: '+',
      existingButton: 'Dashboard'
    }
  }
};
module.exports.externalServices = externalServices;
