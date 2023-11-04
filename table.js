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
        this.clearQuery();
    }
    remove(remField) {
        if (super.remove(remField)) return "field not in table";
        this.queries.reduceRight( (_, value, index) => {
            if (value[0] == remField) {
                delete this.queryMask[value.join(" ")];
                this.activeQuery.splice(index, 1);
                this.queries.splice(index, 1);
            }
        }, 0);
    }
    insert() {
        if (super.insert(...arguments)) return "blank record";
        const args = arguments[0].map( (value, index) => value ? value : this.defaultValues[index]);
        for (const query of this.queries) {
            const operand = query[2] && !isNaN(query[2]) ? Number(query[2]) : "\"" + query[2] + "\"";
            if (eval("\"" + args[this.fields.indexOf(query[0])] + "\"" + query[1] + operand)) this.queryMask[query.join(" ")].push(this.records-1);
        }
    }
    delete(index) {
        if (super.delete(index)) return "index out of range";
        for (const query of this.queries) {
            const key = query.join(" ");
            const indexOfRecord = this.queryMask[key].indexOf(index); // index in query list of records of provided index
            this.queryMask[key] = this.queryMask[key].map( value => value > index ? value-1 : value ); // decrement index of rows after removed row
            if (indexOfRecord+1) this.queryMask[key].splice(indexOfRecord, 1); // remove index (record) from query list of records
        }
    }
    clearQuery () {
        this.queries = [];
        this.activeQuery = [];
        this.queryMask = {};
    }
    addQuery (field, operator = "==", value) {
        const args = Array.from(arguments);
        for (const query of this.queries) if (query.toString() == args.toString()) return true; // return if query already applied
        const operand = value && !isNaN(value) ? Number(value) : "\"" + value + "\"";
        this.queryMask[args.join(" ")] = [];
        for (let i = 0; i < this.records; i++) if (eval("\""+ this.data[field][i] +"\"" + operator + operand)) this.queryMask[args.join(" ")].push(i);
        this.queries.push(args);
        this.activeQuery.push(true);
    }
    remQuery () {
        // remove query
    }
    htmlTable() {
        if (!Object.keys(this.data).length) return ""; // return if no table data
        const arr2d = [];
        let tableHTML = "<table><tr>";
        for (const field of this.fields) {
            arr2d.push(this.data[field]);
            tableHTML += "<th>" + field + "</th>"
        }
        const transpose = arr2d[0].map((_, rowIndex) => arr2d.map(column => column[rowIndex]));
        // get indicies of records filtered by queries
        const active = this.activeQuery.reduce( (total, value, index) => value ? [...total, this.queryMask[this.queries[index].join(" ")]] : total, [] ) // get active queries
            .reduce( (total1, value1) => total1.reduce( (total2, value2) => value1.includes(value2) ? [...total2, value2] : total2, [] ), 
                Array.from(Array(this.records).keys())); // reduce list of record indicies for each query into a single list
        for (const row of active) {
            tableHTML += "</tr><tr>";
            for (const value of transpose[row]) tableHTML += "<td>" + value + "</td>";
        }
        tableHTML += "</tr></table>";
        return tableHTML
    }
}