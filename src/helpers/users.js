const users = [];

/** get a user by id
 * @param {number} userId user id
 * @returns user object
 */
export const getUserData = (userId) => users.find((u) => u.id === userId);

/** fetch user and add to user storage
 * @param {string} userId user id
 * @returns promise which fullfills into the user object
 */
export function fetchUserData(userId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "users/" + userId)
      .then((res) => res.json())
      .then((userRes) => {
        users.push(userRes[0]);
        resolve(userRes[0]);
      })
  );
}

export const addUsersToStorage = (newUsers) =>
  newUsers.forEach((user) => users.push(user));

export default users;
