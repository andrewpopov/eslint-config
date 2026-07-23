'use strict';

/**
 * Factory for permanently exempting a set of files from one rule.
 *
 * @param {string} rule
 * @param {string[]} files
 * @returns {import('eslint').Linter.Config[]}
 */
function exemptFilesFromRule(rule, files) {
  return [
    {
      files,
      rules: {
        [rule]: 'off',
      },
    },
  ];
}

module.exports = exemptFilesFromRule;
