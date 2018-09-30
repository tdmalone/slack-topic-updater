/**
 * Tests for index.js.
 *
 * @author Tim Malone <tdmalone@gmail.com>
 */

'use strict';

const index = require( './index' );

const mockSlackClient = {

  channels: {
    setTopic: jest.fn().mockResolvedValue(),
    history: jest.fn().mockResolvedValue({ messages: [] })
  },

  chat: {
    delete: jest.fn().mockResolvedValue()
  }

};

describe( 'update()', () => {

  const validOptions = {
    token: 'xoxp-test',
    channel: 'C12345678',
    topic: 'Test topic'
  };

  it( 'sets the provided topic text in the provided channel', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: validOptions.channel,
      topic: validOptions.topic
    };

    await index.update( validOptions, mockSlackClient );

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'retrieves the latest channel history', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: validOptions.channel
    };

    await index.update( validOptions, mockSlackClient );

    expect( mockSlackClient.channels.history ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.history ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'deletes the latest topic update message only', async() => {
    expect.hasAssertions();

    // This test also implicitly tests:
    // - does not delete additional topic update messages
    // - does not delete a non-channel topic subtype'd message
    // - does not delete messages without a subtype

    const sampleMessages = [
      {
        ts: 0,
        text: 'Message with no subtype'
      },
      {
        ts: 1,
        text: 'Message with non channel_topic subtype',
        subtype: 'something_random'
      },
      {
        ts: 2,
        text: 'First (latest) message with channel_topic subtype',
        subtype: 'channel_topic'
      },
      {
        ts: 3,
        text: 'Second (older) message with channel_topic subtype',
        subtype: 'channel_topic'
      }
    ];

    mockSlackClient.channels.history = jest.fn().mockResolvedValue({ messages: sampleMessages });

    const expectedOptions = {
      ts: sampleMessages[2].ts,
      channel: validOptions.channel
    };

    await index.update( validOptions, mockSlackClient );

    expect( mockSlackClient.chat.delete ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.chat.delete ).toHaveBeenCalledWith( expectedOptions );
  });

}); // Update().
