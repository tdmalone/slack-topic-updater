# Slack Topic Updater

Updates a Slack channel's topic, then 'hides' the topic update notice by deleting it afterwards. Useful for regular scripted updates of a channel's topic.

## Why?

Updating a Slack channel topic is pretty simple. But, it leaves a message behind saying the topic has been updated. If you want to automate topic updates - for example, to use them as a 'ticker' of sorts - this can result in a lot of useless noise.

So, this module abstracts into one line the process of checking the current topic, querying the latest channel messages, and then deleting the topic update message. All this happens quite quickly, so no-one will notice the topic update message appearing unless they're watching quite intently!

As a bonus, the same topic text can be sent to multiple channels at the same time.

## Usage

Add to your project:

    npm install --save slack-topic-updater

Or if you use [Yarn](https://yarnpkg.com/):

    yarn add slack-topic-updater

Then, call like this:

    const slackTopicUpdater = require('slack-topic-updater');

    const response = await slackTopicUpdater.update({
      token: 'xoxp-0000000000-000000000000-000000000000-00000000000000000000000000000000',
      channel: 'C12345678',
      topic: 'This topic was last updated at ' + Date.now()
    });

The response from Slack will be passed straight back through to you. In practice, this means that if `response.ok` is `true`, the actions have successfully completed.

Alternatively, you can instead pass an array of channel IDs as `channels`. If you do this, you'll also receive an array of Slack responses back - one for each channel.

    const response = await slackTopicUpdater.update({
      token: 'xoxp-0000000000-000000000000-000000000000-00000000000000000000000000000000',
      channels: [
        'C12345678',
        'C98765432'
      ],
      topic: 'This topic was last updated at ' + Date.now()
    });

## Authorisation

To get your Slack token, create an app from [api.slack.com/apps](https://api.slack.com/apps). After making it to the app management screen, from _Features: OAuth & Permissions_, and then under _Scopes_, you'll need to select:

* `channels:write` (to set the topic);
* `channels:history` (to search for the topic update message); and
* `chat:write:user` (to delete the topic update message).

Once you've added the scopes, follow the instructions under _Settings: Install App_. You should be provided with an _OAuth Access Token_, which is what you'll need to send through to this module.

(Note that bot user tokens are not supported by the [`channels.setTopic`](https://api.slack.com/methods/channels.setTopic) endpoint, so they can't be used here - you must use a user token).

## Running Tests

    npm test

or

    yarn test

## TODO

* Only update topic message if it's different to the one currently there
* Only delete topic message if it was sent on behalf of the authenticated user
* Add better error handling, especially when encountering the 'message_not_found' error on topic update message deletion
* Complete in-progress (skipped) tests
* Support for private channels (aka groups)
* Better errors if multiple channels (or really, a non-string) are provided in the 'channel' attribute

## Problems?

Please feel free to [log an issue](https://github.com/tdmalone/slack-topic-updater/issues/new), or - if you can solve a problem yourself - pull requests will be gladly accepted. If you add new functionality, please add tests to cover it.

## License

[MIT](LICENSE).
