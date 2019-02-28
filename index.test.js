/**
 * Tests for index.js.
 *
 * @author Tim Malone <tdmalone@gmail.com>
 */

'use strict';

const index = require( './index' );

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
    text: 'First message with channel_topic subtype',
    subtype: 'channel_topic'
  },
  {
    ts: 3,
    text: 'Second message with channel_topic subtype',
    subtype: 'channel_topic'
  },
  {
    ts: 4,
    text: 'Second message with channel_topic subtype',
    subtype: 'group_topic'
  },
  {
    ts: 5,
    text: 'Second message with channel_topic subtype',
    subtype: 'group_topic'
  }
];

const sampleMessageWithNoSubtype = sampleMessages[0];
const sampleMessageWithAltSubtype = sampleMessages[1];

const sampleMessagesWithChannelTopic = [
  sampleMessages[2],
  sampleMessages[3]
];

const sampleMessagesWithGroupTopic = [
  sampleMessages[4],
  sampleMessages[5]
];

const mockSlackClient = {

  channels: {
    setTopic: jest.fn().mockResolvedValue(),
    history: jest.fn().mockResolvedValue({ messages: sampleMessages })
  },

  groups: {
    setTopic: jest.fn().mockResolvedValue(),
    history: jest.fn().mockResolvedValue({ messages: sampleMessages })
  },

  chat: {
    delete: jest.fn().mockResolvedValue()
  }

};

const singleChannelOptions = {
  token: 'xoxp-test',
  channel: 'C12345678',
  topic: 'Test topic'
};

const multiChannelOptions = {
  token: singleChannelOptions.token,
  channels: [
    'C12345678',
    'C98765432'
  ],
  topic: singleChannelOptions.topic
};

describe( 'isPrivate()', () => {

  it( 'returns true for a private channel', async() => {
    expect( index.isPrivate( 'G987654321' ) ).toBe( true );
  });

  it( 'returns false for an ordinary channel', async() => {
    expect( index.isPrivate( 'C987654321' ) ).toBe( false );
  });

  it( 'returns false when given something not resembling a channel ID at all', async() => {
    expect( index.isPrivate( 'whatever' ) ).toBe( false );
  });

});

describe( 'updateSingleChannel()', () => {

  it( 'sets the provided topic text in the provided channel', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: singleChannelOptions.channel,
      topic: singleChannelOptions.topic
    };

    await index.updateSingleChannel( singleChannelOptions, mockSlackClient );

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'retrieves the latest channel history', async() => {
    expect.hasAssertions();

    const expectedOptions = {
      channel: singleChannelOptions.channel
    };

    await index.updateSingleChannel( singleChannelOptions, mockSlackClient );

    expect( mockSlackClient.channels.history ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.history ).toHaveBeenCalledWith( expectedOptions );
  });

  it( 'calls private channel endpoints instead, if supplied with a private channel ID', async() => {
    expect.hasAssertions();

    const options = Object.assign({}, singleChannelOptions );
    options.channel = 'G12345678';

    await index.updateSingleChannel( options, mockSlackClient );

    expect( mockSlackClient.groups.setTopic ).toHaveBeenCalled();
    expect( mockSlackClient.groups.history ).toHaveBeenCalled();
    expect( mockSlackClient.channels.setTopic ).not.toHaveBeenCalled();
    expect( mockSlackClient.channels.history ).not.toHaveBeenCalled();
  });

  it( 'does not delete a message without a \'subtype\'', async() => {
    expect.hasAssertions();

    await index.updateSingleChannel( singleChannelOptions, mockSlackClient );

    expect( mockSlackClient.chat.delete ).toHaveBeenCalled();
    expect( mockSlackClient.chat.delete ).not
      .toHaveBeenCalledWith( expect.objectContaining({ ts: sampleMessageWithNoSubtype.ts }) );

  });

  it( 'does not delete a non-channel topic \'subtyped\'', async() => {
    expect.hasAssertions();

    await index.updateSingleChannel( singleChannelOptions, mockSlackClient );

    expect( mockSlackClient.chat.delete ).toHaveBeenCalled();
    expect( mockSlackClient.chat.delete ).not
      .toHaveBeenCalledWith( expect.objectContaining({ ts: sampleMessageWithAltSubtype.ts }) );

  });

  it( 'deletes all topic update messages', async() => {
    expect.hasAssertions();
    await index.updateSingleChannel( singleChannelOptions, mockSlackClient );

    expect( mockSlackClient.chat.delete )
      .toHaveBeenCalledTimes( sampleMessagesWithChannelTopic.length );

    for ( let iterator = 0; iterator < sampleMessagesWithChannelTopic.length; iterator++ ) {

      const singleOptions = {
        channel: singleChannelOptions.channel,
        ts: sampleMessagesWithChannelTopic[iterator].ts
      };

      expect( mockSlackClient.chat.delete ).toHaveBeenNthCalledWith( iterator + 1, singleOptions );

    }
  });

  it( 'deletes a private channel topic update message', async() => {
    expect.hasAssertions();

    const options = Object.assign({}, singleChannelOptions );
    options.channel = 'G12345678';

    await index.updateSingleChannel( options, mockSlackClient );

    expect( mockSlackClient.chat.delete )
      .toHaveBeenCalledTimes( sampleMessagesWithGroupTopic.length );

    for ( let iterator = 0; iterator < sampleMessagesWithGroupTopic.length; iterator++ ) {

      const singleOptions = {
        channel: options.channel,
        ts: sampleMessagesWithGroupTopic[iterator].ts
      };

      expect( mockSlackClient.chat.delete ).toHaveBeenNthCalledWith( iterator + 1, singleOptions );

    }
  });

  it( 'returns a promise', async() => {
    expect( index.updateSingleChannel( singleChannelOptions, mockSlackClient ) )
      .toBeInstanceOf( Promise );
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
        channel: singleChannelOptions.channel,
        topic: singleChannelOptions.topic
      });
    }).toThrow();

    expect( () => {
      index.update({
        token: '',
        channel: singleChannelOptions.channel,
        topic: singleChannelOptions.topic
      });
    }).toThrow();

  });

  it( 'throws if \'topic\' is not provided', () => {

    expect( () => {
      index.update({
        token: singleChannelOptions.token,
        channel: singleChannelOptions.channel
      });
    }).toThrow();

  });

  it( 'does NOT throw on a blank \'topic\'', () => {

    expect( () => {
      index.update({
        token: singleChannelOptions.token,
        channel: singleChannelOptions.channel,
        topic: ''
      });
    }).not.toThrow();

  });

  it( 'throws if both \'channel\' and \'channels\' are not provided', () => {

    expect( () => {
      index.update({
        token: singleChannelOptions.token,
        topic: singleChannelOptions.topic
      });
    }).toThrow();

  });

  it( 'throws if \'channel\' is not provided as a string', () => {

    expect( () => {
      index.update({
        token: singleChannelOptions.token,
        topic: singleChannelOptions.topic,
        channel: [ 'C12345678' ]
      });
    }).toThrow();

  });

  it( 'throws if \'channels\' is not provided as an array', () => {

    expect( () => {
      index.update({
        token: singleChannelOptions.token,
        topic: singleChannelOptions.topic,
        channels: 'C12345678'
      });
    }).toThrow();

  });

  it( 'calls channels.setTopic() with correct options for each \'channels\'', async() => {
    expect.hasAssertions();
    await index.update( multiChannelOptions, mockSlackClient );

    expect( mockSlackClient.channels.setTopic )
      .toHaveBeenCalledTimes( multiChannelOptions.channels.length );

    for ( let iterator = 0; iterator < multiChannelOptions.channels.length; iterator++ ) {

      const singleOptions = {
        channel: multiChannelOptions.channels[iterator],
        topic: multiChannelOptions.topic
      };

      expect( mockSlackClient.channels.setTopic )
        .toHaveBeenNthCalledWith( iterator + 1, singleOptions );

    }
  });

  it( 'calls channels.history() with correct options for each \'channels\'', async() => {
    expect.hasAssertions();
    await index.update( multiChannelOptions, mockSlackClient );

    expect( mockSlackClient.channels.history )
      .toHaveBeenCalledTimes( multiChannelOptions.channels.length );

    for ( let iterator = 0; iterator < multiChannelOptions.channels.length; iterator++ ) {

      const singleOptions = {
        channel: multiChannelOptions.channels[iterator]
      };

      expect( mockSlackClient.channels.history )
        .toHaveBeenNthCalledWith( iterator + 1, singleOptions );

    }
  });

  it( 'calls chat.delete() with correct options for each \'channels\'', async() => {
    expect.hasAssertions();
    await index.update( multiChannelOptions, mockSlackClient );

    const deleteCount = multiChannelOptions.channels.length * sampleMessagesWithChannelTopic.length;
    expect( mockSlackClient.chat.delete ).toHaveBeenCalledTimes( deleteCount );

    for ( let iterator1 = 0; iterator1 < multiChannelOptions.channels.length; iterator1++ ) {
      for ( let iterator2 = 0; iterator2 < sampleMessagesWithChannelTopic.length; iterator2++ ) {

        const singleOptions = {
          channel: multiChannelOptions.channels[iterator1],
          ts: sampleMessagesWithChannelTopic[iterator2].ts
        };

        expect( mockSlackClient.chat.delete )
          .toHaveBeenCalledWith( singleOptions );

      }
    }
  });

  it( 'calls Slack endpoints with correct options if a single \'channel\' is provided', async() => {
    expect.hasAssertions();
    await index.update( singleChannelOptions, mockSlackClient );

    const setTopicOptions = {
            channel: singleChannelOptions.channel,
            topic: singleChannelOptions.topic
          },
          historyOptions = {
            channel: singleChannelOptions.channel
          };

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledWith( setTopicOptions );

    expect( mockSlackClient.channels.history ).toHaveBeenCalledTimes( 1 );
    expect( mockSlackClient.channels.history ).toHaveBeenCalledWith( historyOptions );

    expect( mockSlackClient.chat.delete )
      .toHaveBeenCalledTimes( sampleMessagesWithChannelTopic.length );

    for ( let iterator = 0; iterator < sampleMessagesWithChannelTopic.length; iterator++ ) {

      const deleteOptions = {
        channel: singleChannelOptions.channel,
        ts: sampleMessagesWithChannelTopic[iterator].ts
      };

      expect( mockSlackClient.chat.delete ).toHaveBeenCalledWith( deleteOptions );

    }

  });

  it( 'uses \'channels\' rather than \'channel\' if both are provided', async() => {
    expect.hasAssertions();

    const providedOptions = {
      channel: 'C12345678',
      channels: [ 'C87654321' ],
      token: singleChannelOptions.token,
      topic: singleChannelOptions.topic
    };

    const expectedOptions = {
      channel: providedOptions.channels[0],
      topic: providedOptions.topic
    };

    await index.update( providedOptions, mockSlackClient );

    expect( mockSlackClient.channels.setTopic ).toHaveBeenCalledWith( expectedOptions );

  });

  it( 'returns a promise', async() => {
    expect( index.update( multiChannelOptions, mockSlackClient ) ).toBeInstanceOf( Promise );
  });

}); // Update().
