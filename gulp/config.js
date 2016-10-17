module.exports = {
  concat: {
    src: 'src/**',
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
    src: './src',
    dest: './docs'
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
