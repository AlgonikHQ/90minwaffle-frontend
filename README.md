# 90minWaffle: front-end

The public front-end of [90minwaffle.co.uk](https://90minwaffle.co.uk): styles, navigation and app scripts, the service worker, error pages and icons.

**Every tip, every result, every loss shown.** Football intelligence from StatIQ and FootballIQ.

## Why this is public
90minWaffle is built in the open. The code that runs in your browser is published here, so anyone can see what the site does on their device: what it loads, what it stores and what it sends.

## What's here
| Path | What it is |
|---|---|
| `css/` | Site styles |
| `js/` | Navigation, notifications, predictions, the /me hub, tooltips |
| `sw.js` | Service worker: offline pages and push notifications |
| `404.html`, `500.html` | Error pages |
| `docs/` | How tips are recorded, graded and corrected |

## What's not here
Data, models, edge rules, server configuration and anything holding user data stay private. Nothing in this repository can access the site's systems.

## Privacy, in short
- No payment details are collected or stored, anywhere.
- Analytics are self-hosted.
- Push notifications are opt-in and can be switched off at any time.

## How this repository is kept safe
A weekly job copies the live front-end files here. Before anything is pushed, an automated check blocks the commit if it finds anything that looks like a key, token, private address or personal detail.

## Read more
- [How tips are recorded, graded and corrected](docs/methodology.md)
- [Changelog](CHANGELOG.md)
- [Reporting a security issue](SECURITY.md)

All rights reserved. The source is visible for transparency; please don't reuse it without permission.
