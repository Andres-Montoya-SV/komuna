module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'jest --bail --findRelatedTests',
  ],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': [
    'prettier --write',
  ],
};

