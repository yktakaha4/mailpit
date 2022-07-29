# Mailpit

Mailpit is an email testing tool for developers.

It acts as both an SMTP server, and provides a web interface to view all captured emails.

Mailpit is inspired by [MailHog](#why-rewrite-mailhog), but much, much faster.


## Features

- Runs completely on a single binary
- SMTP server (default `127.0.0.1:1025`)
- Web UI to view emails (HTML format, text, source and MIME attachments, default `127.0.0.1:8025`)
- Real-time web UI updates using websockets for new mail
- Email storage in either memory or disk (using [CloverDB](https://github.com/ostafen/clover)) - note that in-memory has a physical limit of 1MB per email
- Configurable automatic email pruning (default keeps the most recent 500 emails)
- Fast SMTP processing & storing - approximately 300-600 emails per second depending on CPU, network speed & email size
- Can handle tens of thousands of emails


## Planned features

- Optional HTTPS for web UI
- Optional basic authentication for web UI
- Optional authentication for SMTP
- Browser notifications for new mail (HTTPS only)
- Docker container


## Installation

Download a pre-built binary in the [releases](https://github.com/axllent/mailpit/releases/latest). The `mailpit` can be placed in your `$PATH`, or simply run as `./mailpit`. See `mailpit -h` for options.

To build mailpit from source see [building from source](README-BUILDING.md).


### Configuring sendmail

There are several different options available:

You can use `mailpit sendmail` as your sendmail configuration in `php.ini`:
```
sendmail_path = /usr/local/bin/mailpit sendmail
```

If mailpit is found on the same host as sendmail, you can symlink the mailpit binary to sendmail, eg: `ln -s /usr/local/bin/mailpit /usr/sbin/sendmail`  (only if mailpit is running on default 1025 port).

You can use your default system `sendmail` binary to route directly to port `1025` (configurable) by calling `/usr/sbin/sendmail -S localhost:1025`.

You can build a mailpit-specific sendmail binary from source ( see [building from source](README-BUILDING.md)).


## Why rewrite MailHog?

I had been using MailHog for a few years to intercept and test emails generated from several projects. Mailhog has a number of severe performance issues, many of the modules are horribly out of date, and other than a few accepted MRs, it is not actively developed.

Initially I started trying to upgrade a fork of MailHog (both the UI as well as the HTTP server & API), but soon discovered that it is (with all due respect) very poorly designed. It is over-engineered (split over 9 separate projects), has too many unnecessary features for my purpose, and performs exceptionally poorly when dealing with large lumbers of emails or processing any email with an attachment (a single email with a 3MB attachment can take over a minute). The API transmits a lot of duplicate and unnecessary data on every message request for all web calls, and there is no HTTP compression.

In order to improve it I felt it needed to be completely rewritten, and so Mailpit was born.
