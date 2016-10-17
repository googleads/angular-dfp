module.exports = {
  concat: {
    src: 'src/**',
    output: 'angular-dfp.es6',
    dest: '.'
  },
  transpile: {
    src: 'angular-dfp.es6',
    dest: '.'
  },
  compile: {
    src: 'angular-dfp.es6',
    output: 'angular-dfp.min.js',
    dest: '.'
  },
  docs: {
    src: './src',
    dest: './docs'
  },
  demo: {
    src: 'angular-dfp*.js',
    dest: 'demo/static'
  },
  lint: {
    src: 'src/**'
  },
  clean: {
    files: [
      'angular-dfp.min.js',
      'angular-dfp.js',
      'docs',
      'angular-dfp.es6'
    ]
  }
};
