#!/usr/bin/env python
# -*- coding: utf-8 -*-

import flask

app = flask.Flask(__name__)


@app.route('/')
def index():
    return flask.render_template('index.html')


def main():
    app.run('0.0.0.0', debug=True)

if __name__ == '__main__':
    main()
