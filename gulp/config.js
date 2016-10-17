module.exports = {
  concat: {
    src: 'src/**/*.js',
    output: 'angular-dfp.es6.js',
    dest: './bin'
  },
  transpile: {
    src: './bin/angular-dfp.es6.js',
    dest: './bin'
  },
  compile: {
    src: './bin/angular-dfp.es6.js',
    output: 'angular-dfp.min.js',
    dest: './bin'
  },
  docs: {
    src: ['README.md', './src/**/*.js']
  },
  demo: {
    src: './bin/angular-dfp*.js',
    dest: 'demo/static'
  },
  lint: {
    src: 'src/**'
  },
  clean: {
    files: ['bin', 'docs']
  }
};
