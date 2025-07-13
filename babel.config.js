module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
    ['@react-native/babel-preset', { useTransformReactJSXExperimental: false }],
  ],
  plugins: [
    ['@babel/plugin-transform-class-properties', { loose: true }],
  ],
  env: {
    web: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react', 
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['react-native-web', { commonjs: true }],
      ],
    },
  },
};
