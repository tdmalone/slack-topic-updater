/**
 * Updates a Slack channel's topic, then 'hides' the topic update notice by deleting it afterwards.
 * Useful for regular scripted updates of a channel's topic.
 *
 * @see https://slackapi.github.io/node-slack-sdk/web_api
 * @see https://api.slack.com/methods#channels
 * @author Tim Malone <tdmalone@gmail.com>
 */

'use strict';

const slackClient = require( '@slack/client' );

/**
 * Determines whether or not a provided channel ID refers to a private channel. This usually informs
 * informs the particular API endpoints that need to be called when operating on the channel.
 *
 * NOTE: This function does not validate any other aspect of a channel ID. It is entirely possible
 *       to send a channel ID that is for all intents and purposes *invalid*, but still receive
 *       Boolean true back from this function.
 *
 * @param {string} channelId The ID of the channel. Usually looks like C12345678 for public
 *                           channels or G12345678 for private channels.
 * @returns {boolean} Whether the supplied channel ID refers to a private channel or not.
 */
const isPrivate = ( channelId ) => {
  return 'G' === channelId.substring( 0, 1 );
};

/**
 * Updates a single channel's topic.
 *
 * @param {object} options An object containing the 'channel' ID, and the 'topic' to set.
 * @param {object} slack   An authenticated instance of a Slack Web API client.
 * @returns {Promise} A chain of promises to complete the three Slack API actions required.
 */
const updateSingleChannel = ( options, slack ) => {

  // Get these options out of the object so we don't use newer versions of the object when dealing
  // with multiple channels.
  const topic = options.topic,
        channel = options.channel;

  const setTopicEndpoint = isPrivate( channel ) ? slack.groups.setTopic : slack.channels.setTopic,
        historyEndpoint = isPrivate( channel ) ? slack.groups.history : slack.channels.history,
        requiredMessageSubtype = isPrivate( channel ) ? 'group_topic' : 'channel_topic';

  // Set the topic.
  const setTopic = setTopicEndpoint({
    channel,
    topic
  });

  // Get the recent message history.
  const getHistory = setTopic.then( () => {
    return historyEndpoint({ channel });
  });

  // Delete the latest topic update message.
  const deleteUpdateMessages = [];
  getHistory.then( ( data ) => {
    for ( const message of data.messages ) {

      if ( ! message.subtype || requiredMessageSubtype !== message.subtype ) {
        continue;
      }

      deleteUpdateMessages.push(
        slack.chat.delete({
          ts: message.ts,
          channel
        })
      );

    }
  });

  return Promise.all([ setTopic, getHistory, deleteUpdateMessages ]);

}; // UpdateSingleChannel.

/**
 * Updates the topic of one or more channels.
 *
 * @param {object} options An object containing a Slack 'token', the 'channel' ID, and the 'topic'
 *                         to set, or optionally an array of 'channels'. The token needs the scopes:
 *                         channels:write (to set the topic); channels:history (to search for the
 *                         topic update message); and chat:write:user (to delete the topic update
 *                         message) scopes.
 * @param {object} client  Pass in an alternative implementation of a Slack client. Mainly useful
 *                         for testing.
 * @returns {Promise} A chain of promises to complete the three Slack API actions required, or if
 *                    multiple 'channels' are provided, a collection of a chain of promises for
 *                    *each* channel.
 */
const update = ( options, client ) => {

  if ( ! options ) {
    throw new Error( 'No options were provided.' );
  }

  if ( ! options.token ) {
    throw new Error( 'The required option \'token\' was not provided.' );
  }

  if ( '' !== options.topic && ! options.topic ) {
    throw new Error( 'The required option \'topic\' was not provided.' );
  }

  // Take the passed in Slack client, or instantiate a new one.
  const slack = client ? client : new slackClient.WebClient( options.token );

  // Multiple channels?
  if ( options.channels && Array.isArray( options.channels ) && options.channels.length ) {

    const responses = [];

    options.channels.forEach( ( channel ) => {
      const singleChannelOptions = Object.assign( options );
      singleChannelOptions.channel = channel;
      responses.push( updateSingleChannel( options, slack ) );
    });

    return Promise.all( responses );

  }

  // Single channel?
  if ( options.channel && 'string' === typeof options.channel ) {
    return updateSingleChannel( options, slack );
  }

  throw new Error(
    'Either \'channel\' (string) or \'channels\' (array of strings) must be provided.'
  );

}; // Update.

module.exports = {
  update,
  updateSingleChannel,
  isPrivate
};
