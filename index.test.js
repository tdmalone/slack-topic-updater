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

const validOptions = {
  token: 'xoxp-test',
  channel: 'C12345678',
  topic: 'Test topic'
};

describe( 'updateSingleChannel()', () => {

  it( 'sets the provided topic text in the provided channel', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: validOptions.channel,
      topic: validOptions.topic
    };

    await index.updateSingleChannel( validOptions, mockSlackClient );

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'retrieves the latest channel history', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: validOptions.channel
    };

    await index.updateSingleChannel( validOptions, mockSlackClient );

    expect( mockSlackClient.channels.history ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.history ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'deletes all topic update messages', async() => {
    expect.hasAssertions();

    // This test also implicitly tests:
    // - does not delete a non-channel topic 'subtyped' message
    // - does not delete messages without a subtype

    const CHANNEL_TOPIC_MESSAGE_COUNT = 2;

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

    await index.updateSingleChannel( validOptions, mockSlackClient );

    expect( mockSlackClient.chat.delete ).toHaveBeenCalledTimes( CHANNEL_TOPIC_MESSAGE_COUNT );
    expect( mockSlackClient.chat.delete ).toHaveBeenCalledWith( expectedOptions );
  });

  it.skip( 'returns a promise', async() => {
    expect.hasAssertions();
  });

}); // UpdateSingleChannel().

describe( 'update()', () => {

  it( 'throws if no options are provided', () => {
    expect( () => {
      index.update();
    }).toThrow();
  });

  it( 'throws if \'token\' is not provided or is blank', () => {

    expect( () => {
      index.update({
        channel: validOptions.channel,
        topic: validOptions.topic
      });
    }).toThrow();

    expect( () => {
      index.update({
        token: '',
        channel: validOptions.channel,
        topic: validOptions.topic
      });
    }).toThrow();

  });

  it( 'throws if \'topic\' is not provided', () => {

    expect( () => {
      index.update({
        token: validOptions.token,
        channel: validOptions.channel
      });
    }).toThrow();

  });

  it( 'does NOT throw on a blank \'topic\'', () => {

    expect( () => {
      index.update({
        token: validOptions.token,
        channel: validOptions.channel,
        topic: ''
      });
    }).not.toThrow();

  });

  it( 'throws if both \'channel\' and \'channels\' are not provided', () => {

    expect( () => {
      index.update({
        token: validOptions.token,
        topic: validOptions.topic
      });
    }).toThrow();

  });

  it( 'calls updateSingleChannel() for each \'channels\' provided', async() => {
    expect.hasAssertions();
    index.updateSingleChannel = jest.fn();

    const options = {
      token: validOptions.token,
      channels: [
        'C12345678',
        'C98765432'
      ],
      topic: validOptions.topic
    };

    await index.update( options, mockSlackClient );

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledTimes( options.channels.length );

    for ( let iterator = 1; iterator <= options.channels.length; iterator++ ) {

      const singleOptions = {
        channel: options.channels[iterator - 1],
        topic: options.topic
      };

      expect( mockSlackClient.channels.setTopic )
        .toHaveBeenNthCalledWith( iterator, singleOptions );

    }
  });

  it.skip( 'calls updateSingleChannel() once if a single \'channel\' is provided', async() => {
    expect.hasAssertions();
  });

  it.skip( 'uses \'channels\' rather than \'channel\' if both are provided', async() => {
    expect.hasAssertions();
  });

  it.skip( 'returns a promise', async() => {
    expect.hasAssertions();
  });

}); // Update().
