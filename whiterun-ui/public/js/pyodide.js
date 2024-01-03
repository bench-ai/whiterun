

async function pyodideLoader(){
  let pyodide = await loadPyodide();
  console.log(pyodide.runPython(`
            import sys
            sys.version
        `));


  return pyodide;
}

let pyodidePromise = pyodideLoader();

export async function evaluatePython(pythonCode, dataObject){
  let py = await pyodidePromise;

  try{
    let output = py.runPython(pythonCode);

    let result = output(dataObject);
    const jsResult = result.toJs();
    result.destroy();
    return jsResult
  } catch (err){
    console.log(err)
  }
}
