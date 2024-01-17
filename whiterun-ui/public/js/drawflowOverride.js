export class Drawflowoverride extends Drawflow {

  removeNodeId(id) {
    console.log("here doggie")
    var removeNode = this.dispatch('nodeBeforeRemoved', id);
    console.log("finished doggie")

    if(removeNode === true) {

      var moduleName = this.getModuleFromNodeId(id.slice(5))
      if(this.module === moduleName) {
        document.getElementById(id).remove();
      }
      delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
      this.dispatch('nodeRemoved', id.slice(5));
      // this.removeConnectionNodeId(id);
    }
  }

  dispatch (event, details) {
    // Check if this event not exists
    var result = false;
    if (this.events[event] === undefined) {
      // console.error(`This event: ${event} does not exist`);
      return false;
    }

    this.events[event].listeners.forEach((listener) => {
      result = listener(details);

      if(result === undefined) {
        result = true;
      }

    });
    return result;
  }
}
