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
 * Updates a single channel's topic.
 *
 * @param {object} options An object containing a Slack 'token', the 'channel' ID, and the 'topic'
 *                         to set. The token needs the following scopes: channels:write (to set the
 *                         topic); channels:history (to search for the topic update message); and
 *                         chat:write:user (to delete the topic update message) scopes.
 * @param {object} slack   An authenticated instance of a Slack Web API client.
 * @returns {Promise} A chain of promises to complete the three Slack API actions required.
 */
const updateSingleChannel = ( options, slack ) => {

  // Set the topic.
  const setTopic = slack.channels.setTopic({
    channel: options.channel,
    topic: options.topic
  });

  // Get the recent message history.
  const getHistory = setTopic.then( () => {
    return slack.channels.history({ channel: options.channel });
  });

  // Delete the latest topic update message.
  const deleteUpdateMessage = getHistory.then( ( data ) => {
    for ( const message of data.messages ) {
      if ( ! message.subtype || 'channel_topic' !== message.subtype ) continue;
      return slack.chat.delete({
        ts: message.ts,
        channel: options.channel
      });
    }
  });

  return deleteUpdateMessage;

}; // UpdateSingleChannel.

/**
 * Updates the topic of one or more channels.
 *
 * @param {object} options An object containing a Slack 'token', the 'channel' ID, and the 'topic'
 *                         to set, or optionally an array of 'channels'.
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
  if ( options.channels && options.channels.length ) {

    const responses = [];

    options.channels.forEach( ( channel ) => {
      const singleChannelOptions = Object.assign( options );
      singleChannelOptions.channel = channel;
      responses.push( updateSingleChannel( options, slack ) );
    });

    return Promise.all( responses );

  }

  // Single channel?
  if ( options.channel ) {
    return updateSingleChannel( options, slack );
  }

  throw new Error( 'Either \'channel\' or \'channels\' must be provided.' );

}; // Update.

module.exports = {
  update,
  updateSingleChannel
};
