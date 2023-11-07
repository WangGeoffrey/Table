class table {
    constructor () {
        this.fields = [];
        this.defaultValues = [];
        this.records = 0;
        this.data = {};
    }
    add(addField, defaultValue=null) { // add field to table
        if (this.fields.includes(addField)) return "field in table";
        this.fields.push(addField); // add new field
        this.defaultValues.push(defaultValue); // add defualt value of field
        this.data[addField] = Array(this.records).fill(defaultValue); // initialize column with default value
    }
    remove(remField) { // remove field from table
        if (!this.fields.includes(remField)) return "field not in table";
        const index = this.fields.indexOf(remField); // get index of field in table fields
        this.fields.splice(index, 1); // remove field
        this.defaultValues.splice(index, 1); // remove default value of field
        delete this.data[remField]; // delete column from table
        if (this.fields.length == 0) this.records = 0; // reset count of records if no fields
    }
    insert() { // insert record into table
        if (!arguments[0].reduce( (total, value) => total || value, false)) return "blank record";
        // add record, replace blanks with default value of field
        for (const index in arguments[0]) this.data[this.fields[index]].push(arguments[0][index] ? arguments[0][index] : this.defaultValues[index]);
        this.records++;
    }
    delete(index) { // delete record from table
        if (index >= this.records) return "index out of range";
        for (const col in this.data) this.data[col].splice(index, 1); // remove record at index
        this.records--;
    }
    htmlTable() { // return table as table elements for html
        if (!Object.keys(this.data).length) return ""; // return if no table data
        const arr2d = [];
        let tableHTML = "<table><tr>";
        for (const field of this.fields) {
            arr2d.push(this.data[field]);
            tableHTML += "<th>" + field + "</th>"
        }
        const transpose = arr2d[0].map((_, rowIndex) => arr2d.map(column => column[rowIndex]));
        for (const row of transpose) {
            tableHTML += "</tr><tr>";
            for (const value of transpose[row]) tableHTML += "<td>" + value + "</td>";
        }
        tableHTML += "</tr></table>";
        return tableHTML
    }
}

class queryTable extends table { // implement queries for table
    constructor() {
        super()
        this.queries = {};
    }
    remove(remField) {
        if (super.remove(remField)) return "field not in table";
        for (const [key, value] of Object.entries(this.queries)) if (remField == value.query[0]) this.remQuery(key);
    }
    insert() {
        if (super.insert(...arguments)) return "blank record";
        const record = arguments[0].map( (value, index) => value ? value : this.defaultValues[index]);
        for (const [key, value] of Object.entries(this.queries)) {
            const [field, operator, queryValue] = value.query;
            const operand = queryValue && !isNaN(queryValue) ? Number(queryValue) : "\"" + queryValue + "\"";
            if (eval("\"" + record[this.fields.indexOf(field)] + "\"" + operator + operand)) this.queries[key].rows.push(this.records-1);
        }
    }
    delete(index) {
        if (super.delete(index)) return "index out of range";
        for (const [key, value] of Object.entries(this.queries)) {
            const indexOfRecord = value.rows.indexOf(index);
            if (indexOfRecord+1) { // +1 for indexOfRecord 0
                this.queries[key].rows = this.queries[key].rows.map( value => value > index ? value-1 : value ); // decrement index of rows after removed row
                this.queries[key].rows.splice(indexOfRecord, 1); // remove index (record) from query list of records
            }
        }
    }
    addQuery (field, operator = "==", value) { // add query
        const args = Array.from(arguments);
        const newQuery = args.join(" ");
        for (const query of Object.keys(this.queries)) if (query == newQuery) return true; // return if repeated query
        const operand = value && !isNaN(value) ? Number(value) : "\"" + value + "\"";
        this.queries[newQuery] = {
            query: args,
            active: true,
            rows: []
        }
        for (let i = 0; i < this.records; i++) if (eval("\""+ this.data[field][i] +"\"" + operator + operand)) this.queries[newQuery].rows.push(i);
    }
    remQuery (query) { // remove query
        delete this.queries[query];
    }
    queried () { // return list of indicies for queried records
        const keys = [];
        for (const [key, value] of Object.entries(this.queries)) if (value.active) keys.push(key);
        if (!keys.length) return Array.from(Array(this.records).keys()); // return all indicies if no queries or non applied
        let result = this.queries[keys.shift()].rows, temp = [];
        for (const key of keys) {
            for (const row of this.queries[key].rows) if (result.includes(row)) temp.push(row);
            result = temp;
            temp = [];
        }
        return result
    }
    htmlTable() {
        if (!Object.keys(this.data).length) return "";
        const arr2d = [];
        let tableHTML = "<table><tr>";
        for (const field of this.fields) {
            arr2d.push(this.data[field]);
            tableHTML += "<th>" + field + "</th>"
        }
        const transpose = arr2d[0].map((_, rowIndex) => arr2d.map(column => column[rowIndex]));
        for (const row of this.queried()) {
            tableHTML += "</tr><tr>";
            for (const value of transpose[row]) tableHTML += "<td>" + value + "</td>";
        }
        tableHTML += "</tr></table>";
        return tableHTML
    }
}
