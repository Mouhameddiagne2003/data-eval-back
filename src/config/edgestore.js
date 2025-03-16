require("dotenv").config();
const { initEdgeStore } = require("@edgestore/server");

const edgeStoreClient = initEdgeStore.create();

module.exports = edgeStoreClient;
