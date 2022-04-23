import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDOM from "react-dom/client";
import "./styles.scss";
import Table from "./components/Table";
import Tooltip from "./components/Tooltip";
import Draggable from "react-draggable";
// icons
import { GrFormAdd } from "react-icons/gr";
const fetchSync = require("sync-fetch");

export const CONFIG = {
  reload: 0,
  toasts: false,
  minSearchLengh: 0,
};

class App extends React.Component {
  constructor(props) {
    super(props);

    const stored = JSON.parse(localStorage.getItem("raumplan"));
    if (stored === undefined)
      localStorage.setItem("raumplan", JSON.stringify({ location: 3 }));
    this.state = {
      location: stored?.location || 3,
      tooltipData: {
        table: null,
        users: null,
      },
      popupOpen: false,
      addUserFormOpen: false,
      addUserTableId: -1,
      movingTable: false,
      movingTableId: -1,
      movingTableNewPos: { x: 0, y: 0, r: 0 },
      movingTableOldPos: { x: 0, y: 0, r: 0 },
    };

    this.images = this.importImages(
      require.context("./img", false, /\.(png|jpe?g|svg)$/)
    );

    this.teams = [];
    this.users = [];
  }

  importImages(r) {
    let images = {};
    r.keys().map((item, index) => {
      return (images[item.replace("./", "")] = r(item));
    });
    return images;
  }

  componentDidMount() {
    this.fetchLocation();
    this.fetchTables();
    if (CONFIG.reload > 0) {
      this.interval = setInterval(() => {
        this.fetchTables();
      }, CONFIG.reload * 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  fetchLocation() {
    const fetchFun = () => {
      return new Promise(async (resolve, reject) => {
        await fetch(
          process.env.REACT_APP_BACKEND + "locations/" + this.state.location
        )
          .then((res) => res.json())
          .then((data) => {
            this.setState({ locationData: data[0] }, resolve);
          })
          .catch((err) => {
            console.error(err);
            reject();
          });
      });
    };

    if (CONFIG.toasts) {
      toast.promise(fetchFun, {
        pending: "fetching location...",
        success: "Location fetched!",
        error: "An error occured while fetching location-data",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      fetchFun();
    }
  }

  fetchTables() {
    const fetchFun = () => {
      return new Promise(async (resolve, reject) => {
        await fetch(
          process.env.REACT_APP_BACKEND + "tables/" + this.state.location
        )
          .then((res) => res.json())
          .then((data) => {
            this.setState({ tables: data }, resolve);
          })
          .catch((err) => {
            console.error(err);
            reject();
          });
      });
    };

    if (CONFIG.toasts) {
      toast.promise(fetchFun, {
        pending: "fetching tables...",
        success: "Tables fetched!",
        error:
          "An error occured while fetching tables OR there might be no tables in this location",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      return fetchFun();
    }
  }

  tooltip = (visible) => this.setState({ tooltipVisibility: visible });

  changeTooltipData = (table, users) =>
    this.setState({ tooltipData: { table: table, users: users } });

  // team functions
  getTeam = (teamName) => {
    const team = this.teams.find((t) => t.name === teamName);
    if (team === undefined) this.fetchTeamSync(teamName);
    return this.teams.find((t) => t.name === teamName);
  };

  fetchTeam = (teamName) => {
    fetch(process.env.REACT_APP_BACKEND + "teams/" + teamName)
      .then((data) => data.json())
      .then((data) => this.teams.push(data[0]))
      .catch((err) => console.log(err));
  };

  fetchTeamSync = (teamName) => {
    let team;
    try {
      team = fetchSync(
        process.env.REACT_APP_BACKEND + "teams/" + teamName
      ).json()[0];
    } catch (error) {
      console.error(
        'Could not find team: "' +
          teamName +
          '" \nConsider adding it to the database!'
      );
      team = { id: -1, name: teamName, color: "#1c1e26" };
    } finally {
      this.teams.push(team);
    }
    // fetchSync(process.env.REACT_APP_BACKEND + "teams/" + team)
    //   .then((data) => data.json())
    //   .then((data) => this.teams.push(data[0]));
    // return new Promise((resolve, reject) => {});
  };

  // userFunctions
  getUser = (userId) => {
    const user = this.users.find((u) => u.id === userId);
    if (user === undefined) this.fetchUserSync(userId);
    return this.users.find((u) => u.id === userId);
  };

  fetchUser = (userId) => {
    fetch(process.env.REACT_APP_BACKEND + "users/" + userId)
      .then((data) => data.json())
      .then((data) => this.users.push(data[0]))
      .catch((err) => console.log(err));
  };

  fetchUserSync = (userId) => {
    const user = fetchSync(
      process.env.REACT_APP_BACKEND + "users/" + userId
    ).json()[0];
    this.users.push(user);
  };

  popup(data) {
    this.setState({
      popupOpen: true,
    });
  }

  addTable() {
    let newTable = {
      tableNumber: "",
      position: {
        x: Math.floor(Math.random() * 200) + 300,
        y: Math.floor(Math.random() * 100),
        r: 0,
      },
      user: [],
      location: this.state.location,
    };
    fetch(process.env.REACT_APP_BACKEND + "addTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTable),
    }).then(() => {
      this.fetchTables();
    });
  }

  changeTableNumber(tableId, newTableNumber) {
    let data = {
      id: tableId,
      tableNumber: newTableNumber,
    };
    fetch(process.env.REACT_APP_BACKEND + "changeTableNumber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      this.fetchTables();
    });
  }

  removeTable(id) {
    fetch(process.env.REACT_APP_BACKEND + "removeTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
      }),
    }).then(() => {
      this.fetchTables();
    });
  }

  addUserFormOpen = (id) =>
    this.setState({ addUserFormOpen: true, addUserTableId: id });

  async addUserToTable(tableId, userId) {
    fetch(process.env.REACT_APP_BACKEND + "addUserToTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        tableId: tableId,
      }),
    }).then(() => this.fetchTables());
  }

  async removeUserFromTable(userId, tableId) {
    fetch(process.env.REACT_APP_BACKEND + "removeUserFromTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId,
        tableId,
      }),
    }).then(() => this.fetchTables());
  }

  MovingTable(props) {
    if (props.movable)
      return (
        <Draggable
          onStop={(e, elem) => {
            props.updateNewPos(elem);
          }}
        >
          <div>{props.children}</div>
        </Draggable>
      );
    return props.children;
  }

  async saveMovedTable() {
    return new Promise((resolve) => {
      const newPos = {
        id: this.state.movingTableId,
        x: this.state.movingTableOldPos.x + this.state.movingTableNewPos.x,
        y: this.state.movingTableOldPos.y + this.state.movingTableNewPos.y,
        r: this.state.movingTableNewPos.r,
      };

      fetch(process.env.REACT_APP_BACKEND + "moveTable", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(newPos),
      })
        .then(async () => await this.fetchTables())
        .then(resolve);
    });
  }

  render() {
    return (
      <div
        id="app"
        style={{
          backgroundImage: `url(${this.images[this.state.locationData?.img]})`,
        }}
      >
        {this.state.tables?.map((table, i) => (
          <this.MovingTable
            key={i}
            movable={
              this.state.movingTable && table.id === this.state.movingTableId
            }
            updateNewPos={(elem) => {
              this.setState({
                movingTableNewPos: {
                  x: elem.x,
                  y: elem.y,
                  r: this.state.movingTableNewPos.r, //this should stay the same bc its not the dragging that defines that
                },
              });
            }}
          >
            <Table
              key={i}
              height={this.state.locationData.tableHeight}
              width={this.state.locationData.tableWidth}
              fontSize={this.state.locationData.fontSize}
              data={table}
              tooltip={(visible) => {
                this.setState({ tooltipVisible: visible });
              }}
              changeTooltipData={(tableData, userData) => {
                this.changeTooltipData(tableData, userData);
              }}
              getTeam={(team) => this.getTeam(team)}
              popup={() => this.setState({ popupOpen: true })}
              popupOpen={this.state.popupOpen}
              moving={
                this.state.movingTable && table.id === this.state.movingTableId
              }
            />
          </this.MovingTable>
        ))}
        <div id="addTableContainer">
          <button onClick={() => this.addTable()}>
            <GrFormAdd />
          </button>
        </div>
        <Tooltip
          table={this.state.tooltipData.table}
          visible={this.state.tooltipVisible}
          popup={this.state.popupOpen}
          openPopup={() => this.setState({ popupOpen: true })}
          closePopup={() => this.setState({ popupOpen: false })}
          changeTableNumber={(id, num) => this.changeTableNumber(id, num)}
          getTeam={(name) => this.getTeam(name)}
          getUser={(id) => {
            return this.getUser(id);
          }}
          removeTable={(id) => {
            if (!window.confirm("Tisch wirklich löschen?")) return;
            this.removeTable(id);
            this.setState({ popupOpen: false });
          }}
          // edit users
          deleteUser={(userId, tableId) => {
            this.removeUserFromTable(userId, tableId);
          }}
          addUserFormOpen={(id) => {
            this.addUserFormOpen(id);
          }}
          addUserToTable={(tableId, userId) =>
            this.addUserToTable(tableId, userId)
          }
          updateTables={() => this.fetchTables()}
          // move tables
          currentlyMovingTable={this.state.movingTable}
          moveTable={(tableId, oldPos) =>
            this.setState({
              movingTable: true,
              movingTableId: tableId,
              movingTableOldPos: oldPos,
            })
          }
          saveMovedTable={async () => {
            await this.saveMovedTable();
            this.setState({ movingTable: false, movingTableId: -1 });
          }}
          resetMovingTable={() => {
            this.setState({ movingTable: false, movingTableId: -1 });
          }}
        />
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  //<React.StrictMode>
  <>
    <App />
    <ToastContainer />
  </>
  // </React.StrictMode>
);
