'use strict';

var Statsd = require('statsd-client');

class StatsdReporter {
    constructor(emitter, reporterOptions, options) {
        this.reporterOptions = reporterOptions;
        this.options = options;
        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, (err, args) => this[e](err, args)) });
    }

    start(err, args) {
        if (!this.reporterOptions.host) {
            throw `ERROR: Destination address is missing! Add --reporter-statsd-host \'<host-address>\'.`;
        }
        if (!this.reporterOptions.port) {
            throw `ERROR: Port is missing! Add --reporter-statsd-port <port-number>.`;
        }
        if (!this.reporterOptions.prefix) {
            this.reporterOptions.prefix = 'newman_report';
        }
        this.statsd = new Statsd({
            host: this.reporterOptions.host,
            port: this.reporterOptions.port
        });
        console.log(`##statsd[${new Date().getTime()} testSuiteStarted name='${this.escape(this.options.collection.name)}']`);
    }

    beforeItem(err, args) {
        this.currItem = { name: this.itemName(args.item), passed: true, failedAssertions: [] };
        console.log(`##statsd[${new Date().getTime()} testStarted name='${this.currItem.name}']`);
    }

    request(err, args) {
        if (!err) {
            this.currItem.request = args.request;
            this.currItem.response = args.response;
        }
    }

    assertion(err, args) {
        if (err) {
            this.currItem.passed = false;
            this.currItem.failedAssertions.push(args.assertion);
        }
    }

    item(err, args) {
        const url = this.currItem.request.url.toString();
        const path = url.replace(/^(?:http(s)?:\/\/)?[\w.-]+/, '');
        // Remove trailing slash to avoid duplications
        path = path.replace(/\/$/, '');
        const method = this.currItem.request.method;

        const prefix = this.reporterOptions.prefix;
        const responseCode = (this.currItem.response && this.currItem.response.code) || "0";
        const duration = (this.currItem.response && this.currItem.response.responseTime) || 0;

        const labels = `path=${path},method=${method},code=${responseCode}`;
        const passed = "passed";

        if (!this.currItem.passed) {
            passed = "failed";
        }

        this.statsd.increment(`${prefix}_requests,${labels}`);
        this.statsd.gauge(`${prefix}_duration,${labels}`, `${duration}`);
        this.statsd.increment(`${prefix}_tests,state=${passed},${labels}`);

        console.log(`##statsd[${new Date().getTime()} testFinished url='${url}' path='${path}' method='${method}' responseCode='${responseCode}' duration='${duration}']`);
    }

    done(err, args) {
        this.statsd.close();
        console.log(`##statsd[${new Date().getTime()} testSuiteFinished name='${this.options.collection.name}']`);
    }

    /* HELPERS */
    itemName(item) {
        const parentName = item.parent && item.parent() && item.parent().name ? item.parent().name : "";
        const folderOrEmpty = (!parentName || parentName === this.options.collection.name) ? "" : parentName + "/";
        return this.escape(folderOrEmpty + item.name);
    }

    escape(string) {
        return string;
    }
}

module.exports = StatsdReporter;
