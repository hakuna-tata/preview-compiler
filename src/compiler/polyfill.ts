export const createRequire = () => {
  return `function(filePath) {
  var module = { exports: {} };
  var matchedPath = __exec_file_map__[filePath]};

  if (!matchedPath) {
    var jsExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    for (var j = 0; j < jsExtensions.length; j++) {
      var pathWithExt = filePath + jsExtensions[j];

      if (__exec_file_map__[pathWithExt]) {
        matchedPath = pathWithExt;
        break;
      }
    }
  }

  var fn = __exec_file_map__[matchedPath];
  if (fn) {
    fn(__require__, module, module.exports);
  } else if (filePath.indexOf(\'@babel/runtime\') === 0) ) {
    // @babel/runtime 相关依赖，从全局对象中获取
    module.exports = window[filePath];
  } else {
    // 第三方包
    var ref = __external_ref_map__[filePath] && __external_ref_map__[filePath].ref;
    if (ref) {
      try {
        module.exports = window[ref.replace('window.', '')];

        return module.exports;
      } catch(e) {
        console.error('从 window 加载模块异常: ', ref); 
      }
    }

    module.exports = window[filePath];
  }
  
  return module.exports;
};
  `;
};
