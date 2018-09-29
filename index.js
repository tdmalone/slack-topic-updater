/**
 * Updates a Slack channel's topic, then 'hides' the topic update notice by deleting it afterwards.
 * Useful for regular scripted updates of a channel's topic.
 *
 * @see https://slackapi.github.io/node-slack-sdk/web_api
 * @see https://api.slack.com/methods#channels
 * @author Tim Malone <tdmalone@gmail.com>
 */

const slackClient = require('@slack/client');

/**
 * Updates the channel's topic.
 *
 * @param {object} options An object containing a Slack 'token', the 'channel' ID, and the 'topic'
 *                         to set. The token needs the following scopes: channels:write (to set the
 *                         topic); channels:history (to search for the topic update message); and
 *                         chat:write:user (to delete the topic update message) scopes.
 */
const update = ( options ) => {

  const slack = new slackClient.WebClient( options.token );

  // Set the topic.
  const setTopic = slack.channels.setTopic({
    channel: options.channel,
    topic: options.topic
  });

  // Get the recent message history.
  const getHistory = setTopic.then( () => {
    return slack.channels.history({ channel: options.channel })
  });

  // Delete the latest topic update message.
  const deleteUpdateMessage = getHistory.then( ( data ) => {
    for ( const message of data.messages ) {
      if ( ! message.subtype || 'channel_topic' !== message.subtype ) continue;
      return slack.chat.delete({ ts: message.ts, channel: options.channel });
    }
  });

  return deleteUpdateMessage;

}; // Update.

module.exports = {
  update
};
