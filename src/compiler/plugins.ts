import type { PluginObj } from '@babel/core';
import * as t from '@babel/types';

export const processRequireExpression = (): PluginObj => {
  return {
    visitor: {
      CallExpression: (path) => {
        if ((path.node.callee as t.Identifier).name === 'require') {
          path.node.callee = t.identifier('__require__');
        }
      }
    }
  }
}
