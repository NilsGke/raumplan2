const fetchSync = require("sync-fetch");

/**variable to hold all teams*/
const teams = [];
export default teams;

/** get team by name (fetches team if its not in array yet)
 * @param {string} teamName team name
 * @returns team object
 */
export function getTeam(teamName) {
  const team = teams.find((t) => t.name === teamName);
  // if team is not found it fetches it
  if (team === undefined) {
    let team;
    try {
      team = fetchSync(
        process.env.REACT_APP_BACKEND + "teams/" + teamName
      ).json()[0];
    } catch (error) {
      // if team does not exist in db then error and add fake team data
      console.warn(
        `Could not find team: ${teamName}\nConsider adding it to the database!`
      );
      team = { id: -1, name: teamName, color: "#1c1e26" };
    } finally {
      teams.push(team);
    }
  }
  return teams.find((t) => t.name === teamName);
}
