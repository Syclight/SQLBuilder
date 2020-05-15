function TableText(flag) {
    let rows = new Array();
    let fields = new Array();
    let __flag = flag  // 0, 全部 1，建表sql，2，外键约束sql

    let tableName = "";

    let sqlConStr = "";
    let sqlFKAry = new Array();

    /**
     * @param {string} str
     */
    this.create = (str, name) => {
        try {
            rows = str.split('\n');
        } catch (error) {
            rows.push(str);
        }
        tableName = name;
    }

    this.excute = () => {
        if (rows.length > 0) {
            rows.forEach(row => {
                if (row != " " && row != "") {
                    try {
                        let field = new Field(row);
                        field.excute();
                        fields.push(field);
                    } catch (error) {
                        return row;
                    }
                }
            });
        }
        let builder = new sqlStrBuilder(fields, tableName);

        switch (__flag) {
            case 0:
                builder.excuteCon();
                sqlConStr = builder.getSqlConStr();
                builder.excuteFK();
                sqlFKAry = builder.getSqlFKAry();
                break;
            case 1:
                builder.excuteCon();
                sqlConStr = builder.getSqlConStr();
                break;
            case 2:
                builder.excuteFK();
                sqlFKAry = builder.getSqlFKAry();
                break;
            default:
                break;
        }

        return null;
    }

    this.getSqlConStr = () => {
        return sqlConStr;
    }

    this.getSqlFKAry = () => {
        return sqlFKAry;
    }
};

/**
 * @param {string} str
 */
function Field(str) {
    const spFlag = '\t';
    let params = new Array();
    try {
        params = str.split(spFlag);
    } catch (error) {
        throw error;
    }

    this.name = params[0];
    this.type = params[1];
    this.comment = params[2];

    const NOT_NULL = "非空";
    const DEFAULT = "默认值为";
    const PRIMARY_KEY = "主键";
    const FOREIGN_KEY = "外键";
    const ENDCHAR = "，";
    const TABLECHAR = "表";

    this.isPK = false;
    this.isNotNull = false;
    this.hasDefualt = false;
    this.hasFK = false;

    this.defaultStr = "";
    this.FKTable = "";
    this.FKName = "";

    /**
     * @param {number} length
     */
    this.execPK_NN = length => {
        let len = PRIMARY_KEY.length;
        this.queue = new miniQueue(len);
        for (let i = 0; i < length; ++i) {
            this.queue.push(this.comment.charAt(i));
            if (this.queue.toString() == PRIMARY_KEY && !this.isPK) {
                this.isPK = true;
            }
            if (this.queue.toString() == NOT_NULL && !this.isNotNull) {
                this.isNotNull = true
            }
            if (this.isPK && this.isNotNull) {
                break;
            }
        }
    }

    /**
     * @param {number} length
     */
    this.execDefault = length => {
        let len = DEFAULT.length;
        this.queue = new miniQueue(len);
        let c = "";
        for (let i = 0; i < length; ++i) {
            c = this.comment.charAt(i);
            this.queue.push(c);
            if (this.hasDefualt) {
                if (c == ENDCHAR) {
                    break;
                }
                this.defaultStr += c;
            }
            if (this.queue.toString() == DEFAULT) {
                this.hasDefualt = true;
            }
        }
    }

    /**
     * @param {number} length
     */
    this.execFK = length => {
        let len = FOREIGN_KEY.length;
        this.queue = new miniQueue(len);
        let c = "";
        for (let i = 0; i < length; ++i) {
            c = this.comment.charAt(i);
            this.queue.push(c);
            if (this.queue.toString() == FOREIGN_KEY) {
                this.hasFK = true;
                break;
            }
        }

        if (this.hasFK) {
            let strs = this.comment.split(ENDCHAR);
            /**
             * @param {string} sen
             */
            strs.forEach(sen => {
                if (sen.indexOf(TABLECHAR + FOREIGN_KEY) > 0) {
                    this.FKTable = (sen.split(TABLECHAR))[0];
                    this.FKName = this.name;
                }
            });
        }
    }

    this.excute = () => {
        let len = this.comment.length
        this.execPK_NN(len);
        this.execDefault(len);
        this.execFK(len);
    }

}


function sqlStrBuilder(fieldAry, tableName) {
    const CONSTR_HEAD = "CREATE TABLE "

    const PK = "PRIMARY KEY AUTO_INCREMENT ";
    const notNull = "NOT NULL ";
    const def = "DEFAULT";
    const comment = "COMMENT ";

    let FKHEAD = "ALTER TABLE ";
    let ADD = "ADD ";
    let CONSTRAINT = "CONSTRAINT "
    let FK = "FOREIGN KEY ";
    let _FK = '_FK_'
    let REFERENCES = "REFERENCES ";
    let FKTAIL = "ON DELETE CASCADE ON UPDATE CASCADE";

    let sqlConStr = "";
    let sqlFKStr = "";
    let sqlFKAry = new Array();

    let __fieldAry = fieldAry;
    let __tableName = tableName;

    this.excuteCon = () => {
        sqlConStr += CONSTR_HEAD + __tableName + "(\n";
        let len = __fieldAry.length;
        for (let i = 0; i < len; ++i) {
            let field = __fieldAry[i];
            sqlConStr += field.name + " " + field.type + " ";
            if (field.isPK) {
                sqlConStr += PK + notNull;
            }
            if (field.isNotNull && !field.isPK) {
                sqlConStr += notNull;
            }
            sqlConStr += comment + "\"" + field.comment + "\"";
            if (i + 1 != len) {
                sqlConStr += ",";
            }
            sqlConStr += "\n";
        }
        sqlConStr += ");";
    }

    this.excuteFK = () => {
        const len = __fieldAry.length;
        for (let i = 0; i < len; ++i) {
            const field = __fieldAry[i];
            if (field.hasFK) {
                sqlFKStr += FKHEAD + __tableName + " " + ADD + CONSTRAINT
                sqlFKStr += __tableName + "_" + field.FKTable + _FK + CONSTRAINT + FK + "(";
                sqlFKStr += field.FKName + ") " + REFERENCES + field.FKTable + "(";
                sqlFKStr += field.FKName + ") " + FKTAIL;
                sqlFKAry.push(sqlFKStr);
                sqlFKStr = "";
            }
        }
    }

    this.getSqlConStr = () => {
        return sqlConStr
    }

    this.getSqlFKAry = () => {
        return sqlFKAry;
    }

}

/**
 * @param {number} capcity
 */
function miniQueue(capcity) {
    let size = capcity;
    let index = -1;
    let ary = new Array(size);

    // 数组顶变
    // this.push = e => {
    //     index++;
    //     if (index > capcity - 1) {
    //         ary[--index] = null;
    //     }

    //     for (let i = index; i > 0; --i) {
    //         ary[i] = ary[i - 1];
    //     }

    //     ary[0] = e;
    // }

    // this.pop = () => {
    //     return ary[index--];
    // }

    // this.toString = () => {
    //     let str = "";
    //     for (let i = index; i >= 0; --i) {
    //         str += ary[i];
    //     }

    //     return str;
    // }

    //数组底变
    /**
     * @param {any} e
     */
    this.push = e => {
        index++;
        if (index > capcity - 1) {
            this.pop();
        }
        ary[index] = e;
    }

    this.pop = () => {
        let e = ary[0];
        for (let i = 0; i < index; ++i) {
            ary[i] = ary[i + 1];
        }
        index--;
        return e;
    }

    this.toString = () => {
        let str = "";
        ary.forEach(e => {
            str += e;
        });
        return str;
    }

    this.content = () => {
        return ary;
    }

    this.length = () => {
        return index + 1;
    }

    this.size = () => {
        return size;
    }
}

module.exports = TableText