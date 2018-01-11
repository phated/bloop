var gs = require('glob-stream');
var pumpify = require('pumpify');
var through = require('through2');

var Vinyl = require('vinyl');

var rollup = require('./rollup');

import { Program, squash } from './butternut';

function readImports(globObj, _, cb) {
  var self = this;

  // console.log(globObj);
  rollup.rollup({
    input: globObj.path
  }).then(function(result) {
    // console.log(result);
    var cwd = globObj.cwd;
    var base = globObj.base;

    result.modules.forEach(function(mod) {
      // console.log(mod);
      var file = new Vinyl({
        cwd: cwd,
        base: base,
        path: mod.id,
        contents: Buffer.from(mod.code),
        ast: mod.ast
      });

      self.push(file);
    });

    cb();
  })
}

function src(globs) {
  return pumpify.obj(
    gs(globs),
    through.obj(readImports)
    // through.obj(wrapVinyl)
  )
}

function mangle(options = {}) {
  return through.obj(execMangle);

  function execMangle(file, _, cb) {
    var prog = new Program(file.contents.toString(), file.ast, options);
    var out = prog.export(options);
    file.contents = Buffer.from(out.code);
    // I think butternut mangles the AST so I shouldn't need to overwrite it

    cb(null, file);
  }
}

export { src, mangle }
