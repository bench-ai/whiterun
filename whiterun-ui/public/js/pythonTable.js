export class PythonTable {

  typeHtml = `<select name="types">
          <option value="">-----</option>
          <option value="text">text</option>
          <option value="number">number</option>
          <option value="list">list</option>
          <option value="object">object</option>
          <option value="file">file</option>
          <option value="null">null</option>
          <option value="boolean">boolean</option>
        </select>`;

  constructor(tableId, hasDefault) {

    this.table = document.getElementById(tableId).getElementsByTagName('table')[0];
    this.tableBody = this.table.getElementsByTagName('tbody')[0];

    this.colLimit = 1

    if (hasDefault) {
      this.colLimit += 2
    }

    this.reset()
  }

  reset(){
    if (this.rowCount === 0){
      this.addRow()
    }else{
      while (this.rowCount > 1){
        this.removeRow()
      }
      while(this.colCount > this.colLimit){
        this.removeCol()
      }
    }
  }

  get rowCount(){
    return this.tableBody.rows.length
  }

  get colCount(){
    return this.tableBody.rows[0].cells.length
  }

  addRow() {

    if (this.rowCount < 6) {
      let newRow = this.tableBody.insertRow();

      if (this.colCount < this.colLimit){
        for (let i = this.colCount; i < this.colLimit; i++) {
          newRow.insertCell(i)
        }
      }else{
        for (let i = 0; i < this.colCount; i++) {
          newRow.insertCell(i)
        }
      }

      if (this.colLimit === 3) {
        newRow.cells[0].innerHTML = '<input type="text" name="name[]" value="">';
        newRow.cells[1].innerHTML = '<input type="text" name="value[]" value="">';
      }

      for (let i = this.colLimit - 1; i < this.colCount; i++) {
        newRow.cells[i].innerHTML = this.typeHtml
      }

      // this.rowCount++
    }
  }

  addCol() {
    if (this.colCount < 6) {
      let colCount = this.colCount
      for (let i = 0; i < this.rowCount; i++) {
        console.log(this.colCount)
        let cell = this.tableBody.rows[i].insertCell(colCount)
        cell.innerHTML = this.typeHtml
      }

      let hCell = document.createElement('th');

      let header = this.table.getElementsByTagName('thead')[0];

      hCell.textContent = "Type" + (this.colCount - this.colLimit + 1).toString()

      header.getElementsByTagName('tr')[0].appendChild(hCell);
    }
  }

  removeRow() {
    if (this.rowCount > 1) {
      this.tableBody.deleteRow(this.tableBody.rows.length - 1);
      // this.rowCount--
    }
  }

  removeCol() {
    if (this.colCount > this.colLimit) {
      for (let i = 0; i < this.rowCount; i++) {
        let row = this.tableBody.rows[i]
        row.deleteCell(this.colCount - 1)
      }
      // this.colCount--

      let header = this.table.getElementsByTagName('thead')[0];
      let lastHeaderCell = header.getElementsByTagName('tr')[0].lastElementChild;
      header.getElementsByTagName('tr')[0].removeChild(lastHeaderCell);
    }
  }

  retrieveParameters(){
    const emptyArray = [];
    let header = this.table.getElementsByTagName('thead')[0].querySelectorAll('th');

    for (let i = 0; i < this.rowCount; i++){

      const row = this.tableBody.rows[i];
      let rowString = ""
      const myDict = {}

      for (let j = 0; j < this.colCount; j++){

        const cell = row.cells[j]
        const currentHeader = header[j].textContent

        if (currentHeader.startsWith("Type")){
          const value = cell.querySelector('select').value;
          if (value !== ""){
            rowString += value + " | "
          }
        }else if(currentHeader.startsWith("Name")){
          let name = cell.querySelector('input').value;
          if (name === ""){
            throw new Error("Empty Name");
          } else if (/[^a-z]/i.test(name)){
            throw new Error("names can only contain letters");
          }else{
            myDict[currentHeader.toLowerCase()] = name
          }
        }else{
          let value = cell.querySelector('input').value;
          const newHeader = currentHeader.replace(/ /g, "_");
          if (value !== ""){
            myDict[newHeader.toLowerCase()] = value
          }
        }
      }

      if (rowString === ""){
        throw new Error("At least one type must be provided");
      }

      myDict["type"] = rowString.slice(0, -3);
      emptyArray.push(myDict)
    }
    return emptyArray
  }
}
