const newTable = new queryTable();
const tableElem = document.getElementById("table"); // <table> element
const newField = document.getElementById("new-field"); // <input> element for new field
const newDefault = document.getElementById("new-default"); // <input> element for defualt value of new field
const headerRow = document.getElementById("header-row"); // <hr> element for table fields
const inputRow = document.getElementById("input-row"); // <hr> element with <input> elements for new record
const queries = document.getElementById("queries"); // <div> element containing added queries

function addField() {
    if (event.key !== 'Enter') return; // check when enter key pressed
    if (newField.value == "") return; // return if blank
    const defaultValue = newDefault.value ? newDefault.value : null;
    if (newTable.add(newField.value, defaultValue)) return; // return if field already in table
    // create <th> element with field
    const header = document.createElement("th");
    header.append(document.createTextNode(newField.value));
    header.classList.add("col-"+newField.value);
    header.setAttribute("title", "remove field");
    header.setAttribute("onmouseover", "this.style.backgroundColor = \"#ccc\"");
    header.setAttribute("onmouseout", "this.style.backgroundColor = \"white\"");
    header.setAttribute("onclick", "removeField(this)");
    headerRow.insertBefore(header, headerRow.children[headerRow.children.length-1]);
    // create <input> element for field
    const inputField = document.createElement("input");
    inputField.classList.add("new-record");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("placeholder", defaultValue);
    inputField.setAttribute("onkeydown", "insertRecord()");
    inputField.style.width = "100px";
    // create <td> for <input> element
    const newInput = document.createElement("td");
    newInput.classList.add("col-"+newField.value);
    newInput.appendChild(inputField);
    inputRow.appendChild(newInput);
    // create <td> elements to fill new column with default value
    for (const dataRow of Array.from(document.getElementsByClassName("record-row"))) {
        const data = document.createElement("td");
        data.classList.add("col-"+newField.value);
        data.append(document.createTextNode(defaultValue));
        dataRow.insertBefore(data, dataRow.children[dataRow.children.length-1]); // insert before <td> element to delete row
    }
    newField.value = "";
    newDefault.value = "";
}

function removeField(elem) {
    if (newTable.remove(elem.innerHTML)) return; // return if field not in table
    for (const data of Array.from(document.getElementsByClassName("col-"+elem.innerHTML))) data.remove(); // remove column
    if (!newTable.fields.length) for (const row of Array.from(document.getElementsByClassName("record-row"))) row.remove(); // remove <tr> elements if no table data
    Array.from(queries.children).forEach( value => { if (Array.from(value.children)[1].innerHTML.startsWith(elem.innerHTML)) value.remove() }); // remove queries for removed field
}

function insertRecord() {
    if (event.key !== "Enter") return;
    const newRecord = Array.from(document.getElementsByClassName("new-record"));
    const recordValues = newRecord.map( elem => elem.value );
    if (newTable.insert(recordValues)) return; // return if all records are blank
    newRecord.forEach( elem => elem.value = "");
    // create <tr> element
    const record = document.createElement("tr");
    record.classList.add("record-row");
    // create <td> elements with record data
    for (const value in recordValues) {
        const data = document.createElement("td");
        data.classList.add("col-"+newTable.fields[value]);
        data.append(document.createTextNode(recordValues[value] ? recordValues[value] : newTable.defaultValues[value]));
        record.appendChild(data);
    }
    // create <td> element to delete row
    const del = document.createElement("td");
    del.append(document.createTextNode("delete row"));
    del.setAttribute("onmouseover", "this.parentElement.style.backgroundColor = \"#ccc\"");
    del.setAttribute("onmouseout", "this.parentElement.style.backgroundColor = \"white\"");
    del.setAttribute("onclick", "deleteRecord(this)");
    record.appendChild(del);
    tableElem.children[0].appendChild(record);
}

function deleteRecord(elem) {
    const row = elem.parentElement; // get <tr> element in table
    const elems = Array.from(Array.from(tableElem.children)[0].children); // get list of <tr> elements of table
    newTable.delete(elems.indexOf(row)-2); // -2 for <tbody> containing header and input row
    row.remove();
}

function addQuery (elem) {
    if (event.key !== "Enter") return;
    const queryInput = Array.from(elem.parentElement.children);
    const query = queryInput.map( value => value.value );
    for (const e of queryInput) if (e.value == "") return; // return if blank input
    if (!newTable.fields.includes(query[0])) return; // return if field not a field of table
    if (newTable.addQuery(...query)) return; // return if query repeated
    queryInput.forEach( e => { e.value = "" });
    // create <input> element to toggle query
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = "checked";
    check.style.display = "none";
    // create <div> element to list query
    const queryElem = document.createElement("div");
    queryElem.classList.add("query-elem");
    queryElem.innerHTML = query.join(" ");
    // create <label> element to toggle <input> on click
    const button = document.createElement("label");
    button.style.display = "block";
    button.appendChild(check);
    button.appendChild(queryElem)
    button.setAttribute("onclick", "newTable.activeQuery[Array.from(this.parentElement.children).indexOf(this)] = this.children[0].checked;");
    queries.appendChild(button);
}

function displayTable() {
    document.getElementById("view").innerHTML = newTable.htmlTable();
}