export const createRequire = () => {
  return `function(filePath) {
  var module = { exports: {} };
  var _filePath = filePath;

  if (_filePath.startsWith('./')) {
    _filePath = _filePath.slice(2);
  }
  if (_filePath.startsWith('../')) {
    // 这里简单处理，实际项目可能需要更复杂的路径解析
    _filePath = _filePath.slice(3);
  }

  var matchedPathStr = __exec_file_map__[_filePath];
  if (!matchedPathStr) {
    var jsExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    for (var j = 0; j < jsExtensions.length; j++) {
      var pathWithExt = _filePath + jsExtensions[j];

      if (__exec_file_map__[pathWithExt]) {
        _filePath = pathWithExt;
        break;
      }
    }
  }

  matchedPathStr = __exec_file_map__[_filePath];
  if (matchedPathStr) {
    try {
      // 去除外层的立即执行函数包裹，只保留内部函数体
      var functionBody = matchedPathStr.slice(matchedPathStr.indexOf('{') + 1, matchedPathStr.lastIndexOf('}'));
      // 使用 new Function 将字符串转换为函数
      var matchedPathFn = new Function('__require__', 'module', 'exports', functionBody);
      matchedPathFn(__require__, module, module.exports);
    } catch (error) {
      console.error('执行模块代码时出错:', matchedPathStr, error);
    }
  } else {
    // 第三方包
    var ref = __external_ref_map__[_filePath] && __external_ref_map__[_filePath].ref;
    if (ref) {
      try {
        module.exports = eval(ref);

        return module.exports;
      } catch(e) {
        console.error('从 window 加载模块异常: ', ref); 
      }
    }

    module.exports = window[_filePath];
  }
  
  return module.exports;
};
  `;
};
