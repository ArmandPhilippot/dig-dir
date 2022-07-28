const lintStagedRc = {
  '**/*.(ts|tsx|js|cjs)': ['eslint --cache --fix', 'prettier --write'],
  '*': 'prettier --ignore-unknown --write',
};

export default lintStagedRc;
