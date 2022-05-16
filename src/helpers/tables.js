let tables = [];

/**
 * refreshes Tables
 * @param {number} locationid location id
 * @returns {Promise<void>}
 */
export function addOrRefreshTables(locationid) {
  // return promise
  tables = tables.filter((table) => table.locationId === locationid);
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "tables/" + locationid)
      .then((response) => response.json())
      .then((data) => {
        data.forEach((table) => {
          tables.push(table);
        });
      })
      .then(resolve)
      .catch(reject)
  );
}

/** gets the tables at a specific location
 * @param {number} locationid locaoitn id
 * @returns {Array<Object>} tables
 */
export function getTablesAtLocation(locationid) {
  return tables.filter((table) => table.location === locationid);
}

/** gets the table with a specific id
 * @param {number} tableId table id
 * @returns {Object} table
 */
export function getTableById(tableId) {
  return tables.find((table) => table.id === tableId);
}

/** create new table
 * @param {number} locationId location id
 * @returns {Promise<void>}
 */
export function createNewTable(locationId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "addTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: "",
        position: {
          x: Math.floor(Math.random() * 200) + 300,
          y: Math.floor(Math.random() * 100),
          r: 0,
        },
        user: [],
        location: locationId,
      }),
    })
      .then(resolve)
      .catch(reject)
  );
}

/** sends a post request to delete a table from the db
 * @param {number} tableId table id
 * @returns {Promise<void>}
 */
export function deleteTable(tableId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "removeTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tableId,
      }),
    })
      .then(resolve)
      .catch(reject)
  );
}

export default tables;
