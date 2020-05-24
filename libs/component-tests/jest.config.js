module.exports = {
  name: 'component-tests',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/component-tests',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
