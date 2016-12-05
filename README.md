# angular-dfp

Semantic DoubleClick for Publishers (DFP by Google) integration with AngularJS.

```HTML
<dfp-ad force-safe-frame collapse-if-empty ad-unit="/path/to/my/ad-unit">
  <dfp-size width="728" height="90"></dfp-size>
</dfp-ad>
```

## Description

AngularDfp allows you to interact with Google's GPT library and DFP services
using only Angular directives, effectively replacing any JavaScript to define
and customize your ad slots, as you usually would. Also, it was built especially
with infinite-scroll and other dynamic content strategies in mind and has
out-of-the-box support for it.

## What does it solve?

This library solves two problems:

1. You can define your ad slots using only HTML, which is just plain sweet.
2. It solves problems that are sometimes encountered with GPT and
Single-Page-Applications (SPAs) by giving you manual control over when to fetch
and refresh ads (typically on page redirects within Angular).

## Examples

We have defined (nested) directives that effectively cover all the functionality
of the GPT library.

### Simple Fixed Size Ad

In the simplest case, you'll simply want to define an ad with a fixed size. In
that case, you would have a `dfp-ad` directive, which requires at least one
nested `dfp-size` directive. The `dfp-ad` directive additionally takes some
optional attributes, such as the `collapseEmptyDiv` option you may be familiar
with from the GPT library. For all options, refer to the documentation, which
can be generated from jsdoc with `gulp docs`:

```HTML
<dfp-ad force-safe-frame
        collapse-if-empty
        refresh='3s'
        ad-unit="/path/to/my/ad-unit">
  <dfp-size width="728" height="90"></dfp-size>
</dfp-ad>
```

## Demo

A live demo can be found at
[angular-dfp-demo.appspot.com](http://angular-dfp-demo.appspot.com).

## License

This project is released under the [Apache
License](https://www.apache.org/licenses/LICENSE-2.0). For more information, see
the LICENSE file.
