const fs = require("fs");
const path = require("path");
const TableText = require('./tableText');

function TableTexts() {
    let tTAry = new Array();
    let sqlStrAry = new Array();
    let tableNameAry = new Array();
    let sqlFKStrMap = new Map();
    this.hadRead = false;
    this.hadExc = false;

    this.readFiles = fPath => {
        fs.readdirSync(fPath).forEach(file => {
            if (file.concat('.txt')) {
                let fileName = path.join(fPath, file);
                let fd = fs.openSync(fileName, 'r');
                let tableText = new TableText();
                tableText.create(fs.readFileSync(fd).toString(), file.split('.')[0]);
                tTAry.push(tableText);
                fs.closeSync(fd);
            }
        });
        this.hadRead = true;
    }

    this.execute = idGenStra => {
        tTAry.forEach(e => {
            e.execute(0, idGenStra);
            sqlStrAry.push(e.getSqlConStr());
            tableNameAry.push(e.getTableName());
            let fkAry = e.getSqlFKAry();
            if (fkAry.length != 0) { sqlFKStrMap.set(e.getTableName(), e.getSqlFKAry()); }
        });
        this.hadExc = true;
    }

    this.getTableNameAry = () => {
        return tableNameAry;
    }

    this.getSqlConAry = () => {
        return sqlStrAry;
    }

    this.getSqlFKStrMap = () => {
        return sqlFKStrMap;
    }
}

module.exports = TableTexts