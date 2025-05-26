"use strict";

// # compiler globals
let bytes = null;
let scope = null;
let global = null;
let pindex = 0;
let tokens = null;
let current = null;
let __imports = null;

function hexDump(array) {
  let result = Array.from(array).map((v) => {
    return (v.toString(16));
  });
  return (result);
};

function memoryDump(array, limit) {
  let str = "";
  for (let ii = 0; ii < limit; ii += 4) {
    str += ii;
    str += ": ";
    str += array[ii + 0] + ", ";
    str += array[ii + 1] + ", ";
    str += array[ii + 2] + ", ";
    str += array[ii + 3] + " ";
    str += "\n";
  };
  return (str);
};

function compile(str, imports, sync) {
  // reset
  pindex = 0;
  scope = global = current = __imports = tokens = null;
  bytes = new ByteArray();
  __imports = imports;
  currentHeapOffset = 0;

  // process
    let tkns = scan(str);
  let ast = parse(tkns);
   emit(ast);
 let buffer = new Uint8Array(bytes);
 let dump = hexDump(buffer);

  // output
  if (sync === true) {
    let module = new WebAssembly.Module(buffer);
    let instance = new WebAssembly.Instance(module);
    return ({
      ast: ast,
      dump: dump,
      buffer: buffer,
      memory: instance.exports.memory,
      instance: instance,
      exports: instance.exports
    });
  }
  return new Promise((resolve, reject) => {
    WebAssembly.instantiate(buffer).then((result) => {
      let instance = result.instance;
      resolve({
       ast: ast,
      dump: dump,
      buffer: buffer,
      tokens: tkns,
      memory: instance.exports.memory,
      instance: instance,
      exports: instance.exports
    });
    });
  });
};

let momo = {
  compile: compile
};

if (typeof module === "object" && module.exports) {
  module.exports = momo;
}
else if (typeof window !== "undefined") {
  window.MOMO = momo;
}


function formatAST(node, depth = 0) {
  let output = '';
  const indent = '  '.repeat(depth);
  
  if (node && typeof node === 'object') {
    output += `${indent}↳ ${NodeLabels[node.kind] || 'Node'} `;
    
    // Show important fields
    const fields = [];
    if (node.id) fields.push(`name: ${node.id}`);
    if (node.type) fields.push(`type: ${NodeLabels[node.type] || node.type}`);
    if (node.operator) fields.push(`operator: ${node.operator}`);
    if (node.value) fields.push(`value: ${node.value}`);
    
    if (fields.length > 0) {
      output += `(${fields.join(', ')})`;
    }
    
    output += '\n';
    
    // Recursively format children
    for (const key in node) {
      if (key === 'kind' || key === 'type' || key === 'id') continue;
      
      if (Array.isArray(node[key])) {
        output += `${indent}  ∟ ${key}:\n`;
        node[key].forEach(child => {
          output += formatAST(child, depth + 2);
        });
      } else if (typeof node[key] === 'object') {
        output += `${indent}  ∟ ${key}:\n`;
        output += formatAST(node[key], depth + 2);
      }
    }
  }
  
  return output;
}
