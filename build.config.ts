export default {
  entries: [
    './src/index',
  ],
  outDir: 'dist',
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
  },
  failOnWarn: false,
}
