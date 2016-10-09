# angular-dfp

[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](http://goldsborough.mit-license.org)

Semantic DoubleClick for Publishers (DFP by Google) integration with AngularJS.

## Example

Ever seen DFP like this?

```HTML
<dfp-ad force-safe-frame
        collapse-if-empty
        refresh='3s'
        ad-unit="/35096353/pub-showcase">
  <dfp-size width="728" height="90"></dfp-size>
  <dfp-targeting key="sport" value="football"></dfp-targeting>
  <dfp-targeting key="food">
    <dfp-value>chicken</dfp-value>
    <dfp-value>meatballs</dfp-value>
    <dfp-value>ice cream</dfp-value>
  </dfp-targeting>
  <dfp-responsive browser-width="320" browser-height="0">
    <dfp-size width=320 height=50></dfp-size>
  </dfp-responsive>
  <dfp-responsive browser-width="768" browser-height="0">
    <dfp-size width=728 height=90></dfp-size>
  </dfp-responsive>
  <dfp-responsive browser-width="1024" browser-height="0">
    <dfp-size width=970 height=90></dfp-size>
  </dfp-responsive>
</dfp-ad>
<dfp-audience-pixel></dfp-audience-pixel>
```

## Demo

A live demo can be found at [angular-dfp-demo.appspot.com](angular-dfp-demo.appspot.com).

## License

This project is released under the [MIT License](http://goldsborough.mit-license.org). For more information, see the LICENSE file.

## Authors

[Peter Goldsborough](http://goldsborough.me) + [cat](https://goo.gl/IpUmJn) :heart:

<a href="https://gratipay.com/~goldsborough/"><img src="http://img.shields.io/gratipay/goldsborough.png?style=flat-square"></a>
