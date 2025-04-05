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
  const materialExternalConfig = getExternal(materialDeps, usedMaterials);
  const utilExternalConfig = getExternal(utilDeps, usedUtils);
  console.log(materialExternalConfig);
  console.log(utilExternalConfig);
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
    fileMap,
    moduleName: 'Preview_Compiler',
  }).buildModuleMap(entryFilePath);

  console.log(compiledCode);
}