import { Schema } from './type';
import { getExternal } from './globalExternalAssets';
import { Compiler } from './compiler';

export const generate = async (schema: Schema, options = {}) => {
  const {
    materialDeps,
    usedMaterials,
    utilDeps,
    usedUtils,
  } = schema || {};
  // 物料库 和 工具库 externals 配置
  const {
    result: materialRefs,
    externalUrls: materialUrls,
  } = getExternal(materialDeps, usedMaterials);
  const {
    result: utilRefs,
    externalUrls: utilUrls,
  } = getExternal(utilDeps, usedUtils);

  // 扩展内容
  const schemaMeta = schema?.dslTree?.[0]?.meta || {};
  // 编译代码
  const fileMap = schema?.dslTree?.[0]?.sourceCodeMap || {};
  const entryFilePath = Object.keys(fileMap).find((key) => {
    return key === 'index.jsx' || key === 'index.tsx';
  });
  if (!entryFilePath) {
    console.error('不存在入口文件');
    return;
  }
  
  const compiledCode = new Compiler({
    entryFilePath,
    fileMap,
    externals: {
      refs: {
        ...materialRefs,
        ...utilRefs,
        ...{
          'react': { ref: 'React' },
          'react-dom': { ref: 'ReactDOM' },
        }
      },
      urls: [...materialUrls, ...utilUrls]
    },
    moduleName: 'Preview_Compiler',
  }).generateBundledCode();
 
  return compiledCode;
}