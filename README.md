# newman-reporter-statsd
A [newman](https://github.com/postmanlabs/newman) reporter for StatsD.  See the [newman documentation](https://www.getpostman.com/docs/postman/collection_runs/command_line_integration_with_newman) for more info.

## Getting Started

1. Install `newman`
2. Install `newman-reporter-statsd`

### Prerequisites

1. StatsD
2. [npm](https://www.npmjs.com/)
3. `newman`

```
npm install -g newman
```

### Installing

Install with npm

```
npm install -g newman-reporter-statsd
```

The `-r statsd` is the flag to enable StatsD reporting.

The `--reporter-statsd-host` is the destination ip address.

The `--reporter-statsd-port` is the destination port.

The `--reporter-statsd-prefix` is the prefix of statsd metrics, by default it is set to "newman_report".

```
newman run <collection-url> -r statsd --reporter-statsd-host <ip-address> --reporter-statsd-port <port-number>
```

The output will be sent to statsd via UDP.
