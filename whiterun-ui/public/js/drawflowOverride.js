export class Drawflowoverride extends Drawflow {
  removeConnection() {
    if(this.connection_selected != null) {
      var listclass = this.connection_selected.parentElement.classList;
      var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
    }
    var removeConnection = this.dispatch('connectionBeforeRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );

    if(removeConnection === true) {
      if(this.connection_selected != null) {

        this.connection_selected.parentElement.remove();
        this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);
        this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);
        this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
        this.connection_selected = null;
      }
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
