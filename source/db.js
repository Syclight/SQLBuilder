const mysql = require('mysql');

class DataBase {
    constructor(configJson) {
        this.connection = null;
    }

    connect(configJson) {
        this.connection = mysql.createConnection(configJson);
        this.connection.connect();
    }

    execute(sqlStr){
        let res;
        this.connection.query(sqlStr, function (err, result) {
            if (err) {
                throw err;
            }
            res = result;
        });
        
        return res; 
    }

    close() {
        if (this.connection != null) {
            this.connection.end()
        }

    }
}

module.exports = DataBase