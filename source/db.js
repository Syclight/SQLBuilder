const mysql = require('mysql');

class DataBase {
    constructor() {
        this.connection = null;
    }

    connect(configJson) {
        this.connection = mysql.createConnection(configJson);
        this.connection.connect();
    }

    execute(sqlStr) {
        this.connection.query(sqlStr);
    }

    close() {
        if (this.connection != null) {
            this.connection.end()
        }
    }
}

module.exports = DataBase