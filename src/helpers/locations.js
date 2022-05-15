/**variable to hold all locations*/
const locations = [];
export default locations;

/** get team by name
 * @param {string} locationId location id
 * @returns location object or undefined
 */
export const getLocationData = (locationId) =>
  locations.find((l) => l.id === locationId);

/** fetches loaction
 * @param {string} locationId location id
 * @returns promise, which resolves into the team (or fake team if team cannot be found)
 */
export function fetchLocationData(locationId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "locations/" + locationId)
      .then((res) => res.json())
      .then((data) => data[0])
      .then((location) => {
        locations.push(location);
        resolve(location);
      })
      .catch((error) => {
        console.error(error);
        reject({ error });
      })
  );
}
