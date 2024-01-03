import {getOperator} from "./operatorHandlers.js";

export class ExecutionGraph{
  constructor(nodeMap) {
    this.nodeMap = nodeMap

    this.rootNodeArray = []
    this.leafNodeArray = []

    for(const node of Object.keys(nodeMap)){

      if (Object.keys(nodeMap[node]["inputs"]).length === 0){
        this.rootNodeArray.push(nodeMap[node])
      }else if(Object.keys(nodeMap[node]["outputs"]).length === 0){
        this.leafNodeArray.push(nodeMap[node])
      }
    }

  }

  getGraphInputs(){
    return this.rootNodeArray
  }

  getGraphOutputs(){
    return this.leafNodeArray
  }

  async getGraphExecutionOrder(editor){
    const outputObject = {}

    const collectConnections = (node) => {
      const connectionObject = {}

      Object.keys(node["inputs"]).forEach(inputName=> {
        connectionObject[inputName] = node["inputs"][inputName]["connections"][0]
      })

      return connectionObject
    }

    const data = async (node, nodeMap) => {

      const connectionObject = collectConnections(node)
      const inputObject = {}

      console.log(node)

      for (const connection of Object.keys(connectionObject)){

        let breakOut = false;

        const requiredInput = connectionObject[connection]

        if(requiredInput !== undefined){
          if(outputObject.hasOwnProperty(requiredInput["node"])){
            if(outputObject[requiredInput["node"]].hasOwnProperty(requiredInput["input"])){
              inputObject[connection] = outputObject[requiredInput["node"]][requiredInput["input"]];
            }else{
              breakOut = true;
            }
          }else{
            breakOut = true;
          }

          if (breakOut){
            const returnDict = await data(nodeMap[requiredInput["node"]], nodeMap)
            inputObject[connection] = returnDict[requiredInput["input"]]
          }
        }
      }

      const op = getOperator(node["id"], editor);
      return await op.getOutputObject(inputObject)
    }

    for(const node of this.leafNodeArray){
      await data(node, this.nodeMap)
    }
  }

  isCyclic(){

    const unvisitedSet = new Set(Object.keys(this.nodeMap))
    const visitingSet = new Set()
    const visitedSet = new Set()

    const check = (key, nodeMap) => {

      if (visitingSet.has(key)){
        throw new Error("Graph is cyclical")
      } else if(!visitedSet.has(key)){
        visitingSet.add(key)
        unvisitedSet.delete(key)

        const outputSet = new Set()

        Object.keys(nodeMap[key]["outputs"]).forEach(output => {
          Object.keys(nodeMap[key]["outputs"][output]["connections"]).forEach(outputEdge => {
            outputSet.add(
              nodeMap[key]["outputs"][output]["connections"][outputEdge]["node"]
            )
          })
        })

        outputSet.forEach(key => {
          check(key, nodeMap)
        })

        visitedSet.add(key)
        visitingSet.delete(key)
      }
    }

    while (unvisitedSet.size > 0){
      let node = Array.from(unvisitedSet)[0];
      try {
        check(node, this.nodeMap);
      } catch (err) {
        return true;
      }
    }

    return false;
  }
}
