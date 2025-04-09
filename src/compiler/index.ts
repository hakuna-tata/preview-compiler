import { 
  transform,
  availablePresets,
  availablePlugins,
} from "@babel/standalone";
import { 
  parseDependencies,
  isThirdPartyPackage,
  tryMatchFileWithExtensions,
  resolveRelativePath,
} from './moduleResolver';
import { processRequireExpression } from './plugins';
import { createRequire } from './polyfill';

interface CompilerOpts {
  fileMap: Record<string, string>;
  entryFilePath: string;
  moduleName: string;
  externals?: {
    refs: Record<string, { ref: string }>;
    urls: Array<string>
  };
}

export class Compiler {
  private fileMap: Record<string, string> = {};
  private entryFilePath: string;
  private moduleName: string;
  private externals?:{
    refs: Record<string, { ref: string }>;
    urls: Array<string>
  };

  private compiledModuleMap: Record<string, string> = {};
  private fileVisited = new Set();

  constructor(options: CompilerOpts) {
    this.fileMap = options.fileMap;
    this.entryFilePath = options.entryFilePath;
    this.moduleName = options.moduleName;
    this.externals = options.externals;
  }

  private compileFile({ filePath, code } : { filePath: string, code: string }) {
    if (filePath.endsWith('.css')) {
      return code;
    }

    return transform(code, {
      babelrc: false,
      configFile: false,
      presets: [
        availablePresets['env'],
        availablePresets['react']
      ],
      plugins: [
        processRequireExpression,
        [
          availablePlugins['transform-runtime'],
          {
            'corejs': false,
            'helpers': false,
            'regenerator': true,
            'useESModules': false
          }
        ],
        availablePlugins['syntax-jsx'],
        availablePlugins['proposal-optional-chaining'],
        availablePlugins['proposal-class-properties'],
      ],
    })?.code as string;
  }

  private createModuleWrapper({ filePath, code } : { filePath: string, code: string }) {
    if (filePath.endsWith('.css')) {
      return `(function() {
        var style = document.createElement('style');
        style.textContent = ${JSON.stringify(code.replace(/\n/g, '\\n'))};
        document.head.appendChild(style);
      })`;
    }

    return `(function(__require__, module, exports) {
      ${code.replace(/\\n/g, '\\\\n')}
      
      return exports;
    })`;
  }


  private buildExecFileMap(filePath: string) {
    if (this.fileVisited.has(filePath)) return;
    this.fileVisited.add(filePath);

    const matchedPath = tryMatchFileWithExtensions(filePath, this.fileMap);
    if (!matchedPath) {
      console.error(`不存在 ${filePath} 模块`);
      return;
    }
    const code = this.fileMap[matchedPath];

    const dependencies = parseDependencies({
      filePath: matchedPath,
      code,
    });
    const compiledCode = this.compileFile({ 
      filePath: matchedPath,
      code,
    });

    dependencies.forEach(dep => {
      if (!isThirdPartyPackage(dep)) {
        const resolvedDep = resolveRelativePath(matchedPath, dep);
        this.buildExecFileMap(resolvedDep);
      }
    });

    this.compiledModuleMap[matchedPath] = this.createModuleWrapper({
      filePath: matchedPath,
      code: compiledCode,
    });

    const execFileStr = Object.entries(this.compiledModuleMap).map(([key, value]) => {
      return `['${key}']: \`${value}\``
    }).join(',\n');
    return `{\n ${execFileStr}\n}`;
  }

  private buildLoadCdnScripts() {
    return `
function loadScript(src, callback, errorCallback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = function () {
    callback();
  };
  script.onerror = function () {
    errorCallback();
  };
  document.head.appendChild(script);
}

function loadAllScripts(scripts, successCallback, errorCallback) {
  var promises = [];
  
  scripts.forEach(function(script) {
    promises.push(function(done) {
      loadScript(script, function() { done(null); }, function() { done(new Error('script 加载失败: ' + script)); })
    })
  });

  var completed = 0;
  var hasError = false;
  function checkCompletion() {
    if (completed === promises.length && !hasError) {
      return successCallback();
    }
  }

  promises.forEach(function (promise) {
    promise(function (error) {
      if(error) {
        hasError = true;
        errorCallback(error);
      } else {
        completed++;
        checkCompletion();
      }
    });
  });
}
`;
  }

  private wrapWithUmd(content: string) {
    return `(function(self, fn) {
      if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = fn();
      } else {
        self['${this.moduleName}'] = fn();
      }
    })(self, function() {
      ${content}
    })
  `;
  }

  public generateBundledCode() {
    
    const execFileMapStr = this.buildExecFileMap(this.entryFilePath);

    const content =  `
var __external_url_list__ = ${JSON.stringify(this.externals?.urls || [])};
var __external_ref_map__ = ${JSON.stringify(this.externals?.refs || {})};
var __exec_file_map__ = ${execFileMapStr};

var __require__ = ${createRequire()}

${this.buildLoadCdnScripts()}

loadAllScripts(
  __external_url_list__,
  function () {
    var entryExports = __require__('${this.entryFilePath}');
    const AppComponent = entryExports.default || entryExports;

    var App = eval(AppComponent);
    ReactDOM.render(
      React.createElement(App),
      document.getElementById('root')
    );
  }, 
  function (error) {
    console.error('加载 CDN 资源失败:', error);
  }
);
    `;

    return this.wrapWithUmd(content);
  }
}