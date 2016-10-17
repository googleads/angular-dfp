#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import re

# pylint: disable=W0311

license_text = """* @license Apache
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License."""


def process(contents):
    return re.sub(r'\* @license MIT', license_text, contents)


def main():
  for directory, _, filenames in os.walk('.'):
    for filename in filenames:
      if not re.search(r'^\.(js|es6)$', os.path.splitext(filename)[1]):
        continue
      path = os.path.join(directory, filename)
      with open(path, 'r') as source:
        original = source.read()
      result = process(original)
      with open(path, 'w') as destination:
          destination.write(result)

if __name__ == '__main__':
    main()
