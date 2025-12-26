module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .find(j.FunctionDeclaration)
    .replaceWith((path) => {
      const { node } = path;
      const arrowFunction = j.arrowFunctionExpression(
        node.params,
        node.body,
        false,
      );

      return j.variableDeclaration('const', [
        j.variableDeclarator(node.id, arrowFunction),
      ]);
    })
    .toSource();
};
