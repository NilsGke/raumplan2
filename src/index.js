import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import ReactTooltip from "react-tooltip";
import Draggable from "react-draggable";

// components
import Table from "./components/Table";
import Tooltip from "./components/Tooltip";
import Calender from "./components/Calender";
import LocationDropdown from "./components/LocationDropdown";
import Teamlocation from "./components/Teamlocation";
import Room from "./components/Room";
import "./styles/index.scss";
// icons
import { GrFormAdd, GrMapLocation } from "react-icons/gr";
const fetchSync = require("sync-fetch");

export const CONFIG = {
  reload: 5, // refresh time in seconds
  minSearchLengh: 0,
};

function importImages(r) {
  let images = {};
  r.keys().map((item, index) => {
    return (images[item.replace("./", "")] = r(item));
  });
  return images;
}

/**variable to hold locations*/
let locations = [];

/**variable to hold all users*/
const users = [];

/**variable to hold all teams*/
const teams = [];

let interval;

function App() {
  const stored = JSON.parse(localStorage.getItem("raumplan"));
  if (stored === undefined)
    localStorage.setItem("raumplan", JSON.stringify({ location: 3 }));

  const [locationId, setLocationId] = useState(stored?.location || 3);
  const [locationData, setLocationData] = useState(null);

  const [tables, setTables] = useState(null);
  const [reload, setReload] = useState(false);

  const [teamlocations, setTeamlocations] = useState(null);
  const [rooms, setRooms] = useState(null);

  const [calender, setCalender] = useState({ visible: false, data: null });

  const [tooltipData, setTooltipData] = useState({ table: null, users: null });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [locationDropDownOpen, SetlocationDropDownOpen] = useState(false);
  const [movingTable, setMovingTable] = useState(false);
  const [movingTableId, setMovingTableId] = useState(-1);
  const [movingTableNewPos, setMovingTableNewPos] = useState({
    x: 0,
    y: 0,
    r: 0,
  });
  const [movingTableOldPos, setMovingTableOldPos] = useState({
    x: 0,
    y: 0,
    r: 0,
  });

  /**holds images of the building*/
  const images = importImages(
    require.context("./img", false, /\.(png|jpe?g|svg)$/)
  );

  useEffect(() => {
    if (CONFIG.reload > 0 && interval === null) {
      interval = setInterval(
        () => setLocationId(locationId),
        CONFIG.reload * 1000
      );
    }

    return () => {
      clearInterval(interval);
    };
  });

  // location change
  useEffect(() => {
    const find = locations.find((l) => l.id === locationId);
    if (find === undefined) {
      fetch(process.env.REACT_APP_BACKEND + "locations/" + locationId)
        .then((res) => res.json())
        .then((data) => {
          locations.push(data[0]);
          setLocationData(data[0]);
        })
        .catch((err) => console.error(err));
    } else {
      setLocationData(find);
    }
  }, [locationId]);

  // fetch rooms
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "rooms/" + locationId)
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch((err) => console.error(err));
  }, [locationData, reload, locationId]);

  // fetch rooms
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "teamlocations/" + locationId)
        .then((res) => res.json())
        .then((data) => setTeamlocations(data))
        .catch((err) => console.error(err));
  }, [locationData, reload, locationId]);

  // fetching tables
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "tables/" + locationId)
        .then((res) => res.json())
        .then((data) => setTables(data))
        .catch((err) => console.error(err));
  }, [locationData, reload, locationId]);

  /** function that fetches the location data (such as table size and picture path)
   * @param {number} location
   */
  function fetchLocation(location) {
    return new Promise((resolve, reject) =>
      fetch(process.env.REACT_APP_BACKEND + "locations/" + location)
        .then((res) => res.json())
        .then((data) => {
          locations.push(data[0]);
          setLocationData(data[0]);
        })
        .then(resolve)
        .catch((err) => {
          console.error(err);
          reject();
        })
    );
  }

  /** function that given a userid returns the user object and if user is not avalible yet, fetches it
   * @param {number} userId user id
   * @returns user object
   */
  function getUser(userId) {
    const user = users.find((u) => u.id === userId);
    // if the user is not found, it fetches the user
    if (user === undefined) {
      const user = fetchSync(
        process.env.REACT_APP_BACKEND + "users/" + userId
      ).json()[0];
      users.push(user);
    }
    return users.find((u) => u.id === userId);
  }

  /** function that given a team name returns the team object and if team is not avalible yet, fethes it
   * @param {string} teamName team name
   * @returns team object
   */
  function getTeam(teamName) {
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
        console.error(
          `Could not find team: ${teamName}\nConsider adding it to the database!`
        );
        team = { id: -1, name: teamName, color: "#1c1e26" };
      } finally {
        teams.push(team);
      }
    }
    return teams.find((t) => t.name === teamName);
  }

  /** Table wrapper component to make the table movable
   * @param {*} props table properties
   * @returns table element draggable or not
   */
  function MovingTable(props) {
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

  /** sends a post request to set a new table*/
  function addTable() {
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
    }).then(() => setReload(!reload));
  }

  /** sends a post request to delete a table from the db
   * @param {number} id table id
   */
  function removeTable(id) {
    fetch(process.env.REACT_APP_BACKEND + "removeTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
      }),
    }).then(() => setReload(!reload));
  }

  /** sends request to backend to add a user to a table
   * @param {number} tableId tables id
   * @param {number} userId users id
   */
  async function addUserToTable(tableId, userId) {
    fetch(process.env.REACT_APP_BACKEND + "addUserToTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        tableId: tableId,
      }),
    }).then(() => setReload(!reload));
  }

  /** function that removes a user from a table in the db
   * @param {number} userId users id
   * @param {number} tableId tables id
   */
  async function removeUserFromTable(userId, tableId) {
    fetch(process.env.REACT_APP_BACKEND + "removeUserFromTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId,
        tableId,
      }),
    }).then(() => setReload(!reload));
  }

  /** function that changes the tables number (/name)
   * @param {number} tableId tables id
   * @param {string} newTableNumber table number (can also be letters, so its a string)
   */
  function changeTableNumber(tableId, newTableNumber) {
    fetch(process.env.REACT_APP_BACKEND + "changeTableNumber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tableId,
        tableNumber: newTableNumber,
      }),
    }).then(() => setReload(!reload));
  }

  /** function that opens the serach and puts something in the serach bar
   * @param {string} searchString string to put into the serach bar of the serach thingy
   */
  function openSerach(searchString) {
    console.log("seraching for: " + searchString);
    // TODO:
  }

  /** function that sets up everything for the new location (deletes old tables and stuff)
   * @param {number} id id of the new location
   */
  function changeLocation(id) {
    localStorage.setItem("raumplan", JSON.stringify({ location: id }));
    setMovingTable(false);
    setPopupOpen(false);
    setLocationId(id);
  }

  /** saves the moved table to the db
   * @returns {Promise}
   */
  async function saveMovedTable() {
    return new Promise((resolve) => {
      fetch(process.env.REACT_APP_BACKEND + "moveTable", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: movingTableId,
          x: movingTableOldPos.x + movingTableNewPos.x,
          y: movingTableOldPos.y + movingTableNewPos.y,
          r: movingTableNewPos.r,
        }),
      })
        .then(() => setReload(!reload))
        .then(resolve);
    });
  }

  return (
    <>
      <img src={images[locationData?.img] || ""} alt={"map"} id="map" />
      <div id="app">
        {tables?.map((table, i) => (
          <MovingTable
            key={i}
            movable={movingTable && table.id === movingTableId}
            updateNewPos={(elem) =>
              setMovingTableNewPos({
                x: elem.x,
                y: elem.y,
                r: movingTableNewPos.r,
              })
            }
            rotation={movingTableNewPos.r}
          >
            <Table
              active={
                table.id === tooltipData.table?.id &&
                (tooltipVisible || popupOpen)
              }
              height={locationData.tableHeight}
              width={locationData.tableWidth}
              fontSize={locationData.fontSize}
              data={table}
              tooltip={(visible) => setTooltipVisible(visible)}
              changeTooltipData={(tableData, userData) =>
                setTooltipData({ table: tableData, users: userData })
              }
              getUser={(id) => getUser(id)}
              getTeam={(team) => getTeam(team)}
              popup={() => setPopupOpen(true)}
              popupOpen={popupOpen}
              moving={movingTable && table.id === movingTableId}
              newRotation={movingTableNewPos.r}
            />
          </MovingTable>
        ))}
        {teamlocations?.map((location, i) => (
          <Teamlocation
            key={i}
            openSerach={(s) => openSerach(s)}
            data={location}
          />
        ))}
        {rooms?.map((room, i) => (
          <Room
            key={i}
            data={room}
            openCalender={(data) => setCalender({ visible: true, data: data })}
          />
        ))}
        <div id="floatingButtons">
          <div id="addTableContainer" data-tip="Tisch hinzufügen">
            <button onClick={() => addTable()}>
              <GrFormAdd />
            </button>
          </div>
          <div id="changeLocationContainer" data-tip="Location wechseln">
            <button
              onClick={() => SetlocationDropDownOpen(!locationDropDownOpen)}
            >
              <GrMapLocation />
            </button>
            <LocationDropdown
              open={locationDropDownOpen}
              close={() => SetlocationDropDownOpen(false)}
              locations={locations}
              currentLocation={locationId}
              changeLocation={(id) => changeLocation(id)}
            />
          </div>
        </div>
        <Tooltip
          table={tooltipData.table}
          visible={tooltipVisible}
          popup={popupOpen}
          openPopup={() => setPopupOpen(true)}
          closePopup={() => setPopupOpen(false)}
          changeTableNumber={(id, num) => changeTableNumber(id, num)}
          getTeam={(name) => getTeam(name)}
          getUser={(id) => getUser(id)}
          removeTable={(id) => {
            if (!window.confirm("Tisch wirklich löschen?")) return;
            removeTable(id);
            setPopupOpen(false);
          }}
          // edit users
          deleteUser={(userId, tableId) => removeUserFromTable(userId, tableId)}
          addUserToTable={(tableId, userId) => addUserToTable(tableId, userId)}
          updateTables={() => setReload(!reload)}
          // move tables
          currentlyMovingTable={movingTable}
          moveTable={(tableId, oldPos) => {
            setMovingTableNewPos({ x: 0, y: 0, r: oldPos.r });
            setMovingTableOldPos(oldPos);
            setMovingTableId(tableId);
            setMovingTable(true);
          }}
          spinTable={(degree) =>
            setMovingTableNewPos({
              x: movingTableNewPos.x,
              y: movingTableNewPos.y,
              r: degree,
            })
          }
          saveMovedTable={async () => {
            await saveMovedTable();
            setMovingTable(false);
            setMovingTableId(-1);
            setMovingTableNewPos({ x: 0, y: 0, r: 0 });
          }}
          resetMovingTable={() => {
            setMovingTable(false);
            setMovingTableId(-1);
            setMovingTableNewPos({ x: 0, y: 0, r: 0 });
          }}
        />
        <Calender
          data={calender.data}
          visible={calender.visible}
          close={() => setCalender({ ...calender, visible: false })}
        />
      </div>
      <ReactTooltip effect="solid" offset={{ left: 5 }} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

//FIXME: fix the table moving jumping back (probably only have to overwrite the position of the table with the new position and that should fix it )
// TODO: add rooms with calendars and team signs
// TODO: add serach function
