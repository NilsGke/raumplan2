const users = [];

/** get a user by id
 * @param {number} userId user id
 * @returns user object
 */
export const getUser = (userId) => users.find((u) => u.id === userId);

/** fetch user and add to user storage
 * @param {string} userId user id
 * @returns promise which fullfills into the user object
 */
export function fetchUser(userId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "users/" + userId)
      .then((res) => res.json())
      .then((userRes) => {
        users.push(userRes[0]);
        resolve(userRes[0]);
      })
  );
}

export function addUsers(newUsers) {
  const userIds = users.map((u) => u.id).slice();
  newUsers.filter((u) => !userIds.includes(u.id)).forEach((u) => users.push(u));
}

export default users;
