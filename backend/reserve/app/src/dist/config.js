"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodata = {
    username: process.env.APP_MONGO_USER,
    password: process.env.APP_MONGO_PASS,
    port: process.env.MONGO_PORT,
    dbname: process.env.MONGO_DB
};
exports.default = {
    development: {
        db_url: `mongodb://${mongodata.username}:${mongodata.password}@reserve_mongo:${mongodata.port}/${mongodata.dbname}`,
    },
    homolog: {
        db_url: `mongodb://${mongodata.username}:${mongodata.password}@reserve_mongo:${mongodata.port}/${mongodata.dbname}`,
    },
    prod: {
        db_url: `mongodb://${mongodata.username}:${mongodata.password}@reserve_mongo:${mongodata.port}/${mongodata.dbname}`,
    },
};
//# sourceMappingURL=config.js.map