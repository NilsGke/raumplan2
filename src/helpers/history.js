let history = [];

export function undo() {
  return new Promise(async (resolve, reject) => {
    if (history.length > 0) {
      const lastAction = history.pop();
      await lastAction.undo();
    }
    resolve();
  });
}

export const addToHistory = (action) => history.push(action);

export default history;
