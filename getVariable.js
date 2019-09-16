/* eslint-disable */
const postcss = require('postcss');
const syntax = require('postcss-less');
const uniqBy = require('lodash.uniqby');
const fileNameList = [];

function discardAndReport(less, result) {
  function discardEmpty(node) {
    const { type, nodes: sub } = node;

    if (sub) {
      node.each(discardEmpty);
    }

    if (
      (type === 'decl' && !node.value) ||
      ((type === 'rule' && !node.selector) || (sub && !sub.length)) ||
      (type === 'atrule' && ((!sub && !node.params) || (!node.params && !sub.length)))
    ) {
      node.remove();

      result.messages.push({
        type: 'removal',
        plugin: 'postcss-discard-empty',
        node,
      });
    }
  }

  less.each(discardEmpty);
}
const LocalIdentNamePlugin = postcss.plugin('LocalIdentNamePlugin', options => {
  return (less, result) => {
    less.walkAtRules(atRule => {
      if (atRule.import) {
        atRule.remove();
      }
      if (atRule.mixin) {
        atRule.remove();
      }
    });
    less.walkDecls(decls => {
      const content = decls.toString();
      if (!content.includes('@')) {
        decls.remove();
      }
    });
    less.walkComments(decls => {
      decls.remove();
    });
    discardAndReport(less, result);
  };
});

const AddLocalIdentName = (lessPath, lessText) => {
  lessPath = lessPath;
  return postcss([LocalIdentNamePlugin()])
    .process(lessText, {
      from: lessPath,
      syntax,
    })
    .then(result => {
      result.messages = uniqBy(fileNameList);
      return result;
    });
};

module.exports = AddLocalIdentName;
