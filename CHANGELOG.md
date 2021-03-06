# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.8] - 2021-03-07

### Fixed

- Added now-required pagination settings to calls to Slack's `conversations.history` endpoint

## [0.0.7] - 2021-03-07

### Changed

- Updated all dependencies

### Fixed

- Replaced [deprecated Slack API endpoints](https://api.slack.com/changelog/2020-01-deprecating-antecedents-to-the-conversations-api)

## [0.0.6] - 2019-02-25

### Added

- Support for changing topics in private channels (note: additional scopes required - [see the README](https://github.com/tdmalone/slack-topic-updater#authorisation))

### Changed

- Improved tests to cover everything that's been done so far
- Slightly improved error messaging to avoid confusion with the `channel`/`channels` parameters

## [0.0.5] - 2019-02-25

### Fixed

- Properly requests the right channel for topic update message deletions when dealing with multiple channels

## [0.0.4] - 2019-02-25

### Fixed

- All topic update messages are now deleted, not just the most recent one (fixes #2)

## [0.0.3] - 2019-02-25

### Added

- Ability to specify multiple channels, to update the topic in all of them at once
- Incoming options are now validated before attempting to continue

## [0.0.2] - 2018-10-01

### Added

- Tests, linting, and CI configuration

[Unreleased]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.8...HEAD
[0.0.8]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/tdmalone/slack-topic-updater/compare/v0.0.1...v0.0.2
