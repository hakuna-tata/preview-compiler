import { Schema } from './type';
import {
  getMaterialsExternal, 
  getUtilsExternal,
} from './globalExternalAssets';

export const generate = async (schema: Schema, options = {}) => {
  const {
    materialDeps,
    usedMaterials,
    utilDeps,
    usedUtils,
  } = schema || {};
  // 物料库 和 工具库 externals 配置
  const materialExternalConfig = getMaterialsExternal(materialDeps, usedMaterials);
  const utilExternalConfig = getUtilsExternal(utilDeps, usedUtils);
}