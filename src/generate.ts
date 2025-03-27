import { Schema } from './type';
import { getExternal } from './globalExternalAssets';

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
}