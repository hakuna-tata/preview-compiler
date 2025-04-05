import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export const parseDependencies = (
  { filePath, code } : { filePath: string, code: string}
) => {
  if (filePath.endsWith('.css')) {
    return [];
  }

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties'],
  });

  const dependencies: Array<string> = [];
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      dependencies.push(source);
    }
  });

  return dependencies;
};

export const isThirdPartyPackage = (dependency: string) => {
  return !dependency.startsWith('./') && !dependency.startsWith('../');
};

export const tryMatchFileWithExtensions = (
  filePath: string,
  fileMap: Record<string, string>,
) => {
  const hasExtension = /\.\w+$/.test(filePath);
  if (hasExtension) {
    if (fileMap[filePath]) {
      return filePath;
    }
    return null;
  }

  const jsExtensions = ['.js', '.ts', '.jsx', '.tsx'];
  for (const ext of jsExtensions) {
    const pathWithExt = filePath + ext;
    if (fileMap[pathWithExt]) {
      return pathWithExt;
    }
  }

  return null;
};

export const resolveRelativePath = (
  currentFile: string,
  relativePath: string,
) => {
  if (!relativePath) return currentFile;
  if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
    return relativePath;
  }

  const currentDir = currentFile.split('/');
  // 如果 currentFile 是文件路径，去掉文件名
  if (currentDir[currentDir.length - 1].includes('.')) {
    currentDir.pop();
  }

  const parts = relativePath.split('/');
  for (const part of parts) {
    if (part === '..') {
      if (currentDir.length > 0) {
        currentDir.pop();
      }
    } else if (part !== '.' && part !== '') {
      currentDir.push(part);
    }
  }

  return currentDir.join('/');
}