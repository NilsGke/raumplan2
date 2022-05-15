import React, { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import ReactTooltip from "react-tooltip";
import Draggable from "react-draggable";

// components
import Table from "./components/Table";
import Tooltip from "./components/Tooltip";
import Calender from "./components/Calender";
import Teamlocation from "./components/Teamlocation";
import Room from "./components/Room";
import "./styles/index.scss";
import FloatingButtons from "./components/FloatingButtons";
import Userpopup from "./components/Userpopup";
import FeedbackApp from "./pages/feedback";
// helpers
import { getLocationData, fetchLocationData } from "./helpers/locations";
const fetchSync = require("sync-fetch");

export const CONFIG = {
  reload: 0, // refresh time in seconds
  minSearchLengh: 0,
  darkmode: false,
};

function importImages(r) {
  let images = {};
  r.keys().map((item, index) => {
    return (images[item.replace("./", "")] = r(item));
  });
  return images;
}

let interval = null;

export const MODIFIER_PREFIX =
  window.navigator.appVersion.indexOf("Mac") !== -1 ? "⌘" : "^";

const stored = JSON.parse(localStorage.getItem("raumplan"));
if (stored === undefined)
  localStorage.setItem("raumplan", JSON.stringify({ location: 3 }));

const loactionInUrl = parseInt(window.location.hash.replace("#", ""));

function App() {
  // location stuff
  const [locationId, setLocationId] = useState(
    loactionInUrl || stored?.location || 3
  );
  const [locationData, setLocationData] = useState(null);

  // tables
  const [tables, setTables] = useState(null);
  const [reloadTables, setReloadTables] = useState(true);

  // search function
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOverwrite, setSearchOverwrite] = useState(false);
  // loaction menu
  const [locationDropDownOpen, setLocationDropDownOpen] = useState(false);

  // teams and rooms on the map
  const [teamlocations, setTeamlocations] = useState(null);
  const [rooms, setRooms] = useState(null);

  // calender popup
  const [calender, setCalender] = useState({ visible: false, data: null });

  // tooltip
  const [tooltipTableId, setTooltipTableId] = useState(-1);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  // move a table
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

  // mini-tooltip (ex on floating buttons)
  const [hoverTooltopPosition, setHoverTooltopPosition] = useState("left");

  // highlighters
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [highlightedTable, setHighlightedTable] = useState(null);
  const [highlightTimers, setHighlightTimers] = useState(0);

  // userpopup
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [userPopupUserId, setUserPopupUserId] = useState(null);

  /**holds images of the building*/
  const images = importImages(
    require.context("./img", false, /\.(png|jpe?g|svg)$/)
  );

  const tooltipRef = useRef();

  useEffect(() => {
    if (CONFIG.reload > 0 && interval === null)
      interval = setInterval(() => setReloadTables(true), CONFIG.reload * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // location change
  useEffect(() => {
    const find = getLocationData(locationId);
    if (find === undefined) {
      fetchLocationData(locationId).then((location) =>
        setLocationData(location)
      );
    } else {
      setLocationData(find);
    }
  }, [locationId]);

  // change browser title and browser url
  useEffect(() => {
    document.title = "Raumplan: " + locationData?.name;
    if (locationData?.id)
      window.location.replace(
        window.location.origin +
          window.location.pathname +
          "#" +
          locationData?.id
      );
  }, [locationData]);

  // fetch rooms
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "rooms/" + locationId)
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch((err) => console.error(err));
  }, [locationData, locationId]);

  // fetch team locations
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "teamlocations/" + locationId)
        .then((res) => res.json())
        .then((data) => setTeamlocations(data))
        .catch((err) => console.error(err));
  }, [locationData, locationId]);

  // fetching tables
  useEffect(() => {
    if (reloadTables) {
      if (locationData != null)
        fetch(process.env.REACT_APP_BACKEND + "tables/" + locationId)
          .then((res) => res.json())
          .then((data) => setTables(data))
          .catch((err) => console.error(err));
      setTimeout(() => {
        setReloadTables(false);
      }, 400);
    }
  }, [locationData, reloadTables, locationId]);

  // reset highlighted room after some time
  useEffect(() => {
    if (highlightedRoom !== null || highlightedTable !== null) {
      setHighlightTimers((prevState) => prevState + 1);
      setTimeout(() => {
        setHighlightTimers((prevState) => prevState - 1);
      }, 4000);
    }
  }, [highlightedRoom, highlightedTable]);

  // this is to wait for all the timers to finish, so the animation always runs the full amount
  useEffect(() => {
    if (highlightTimers === 0) {
      setHighlightedRoom(null);
      setHighlightedTable(null);
    }
  }, [highlightTimers]);

  // shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (e.altKey && e.ctrlKey) {
        // key combination
        switch (e.key) {
          case "f":
            setSearchOpen(true);
            setLocationDropDownOpen(false);
            e.preventDefault();
            break;
          case "l":
            setLocationDropDownOpen(true);
            setSearchOpen(false);
            e.preventDefault();
            break;
          case "n":
            addTable();
            break;
          case "r":
            setReloadTables(true);
            e.preventDefault();
            break;
          default:
            break;
        }
      } else if (e.key === "Escape") {
        // escape key
        if (calender.visible) {
          setCalender({ ...calender, visible: false });
        } else if (tooltipRef.current.addUserFormOpen) {
          tooltipRef.current.closeAddUserForm();
        } else if (movingTable) {
          resetMovingTable();
        } else if (popupOpen) {
          setPopupOpen(false);
        } else if (tooltipVisible) {
          setTooltipVisible(false);
        } else if (locationDropDownOpen || searchOpen) {
          setLocationDropDownOpen(false);
          setSearchOpen(false);
        }
      } else if (e.keyCode >= 37 && e.keyCode <= 40) {
        //arrow keys
        if (movingTable) {
          switch (e.keyCode) {
            case 37:
              // left
              setMovingTableNewPos({
                ...movingTableNewPos,
                x: movingTableNewPos.x - 1,
              });
              e.preventDefault();
              break;
            case 38:
              // up
              setMovingTableNewPos({
                ...movingTableNewPos,
                y: movingTableNewPos.y - 1,
              });
              e.preventDefault();
              break;
            case 39:
              // right
              setMovingTableNewPos({
                ...movingTableNewPos,
                x: movingTableNewPos.x + 1,
              });
              e.preventDefault();
              break;
            case 40:
              // down
              setMovingTableNewPos({
                ...movingTableNewPos,
                y: movingTableNewPos.y + 1,
              });
              e.preventDefault();
              break;
            default:
              break;
          }
        } else if (locationDropDownOpen) {
          switch (e.keyCode) {
            case 38:
              // up
              changeLocation(locationId - 1);
              e.preventDefault();
              break;
            case 40:
              // down
              changeLocation(locationId + 1);
              e.preventDefault();
              break;
            default:
              break;
          }
        }
      }
    },
    // eslint-disable-next-line
    [
      locationDropDownOpen,
      searchOpen,
      movingTable,
      popupOpen,
      tooltipVisible,
      movingTable,
      movingTableNewPos,
      setMovingTableNewPos,
      changeLocation,
    ] // addTable should be here instead of the eslint disable, because react expects it to parse every funciton as an dependency
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

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
    }).then(() => setReloadTables(true));
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
    }).then(() => setReloadTables(true));
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
    }).then(() => setReloadTables(false));
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
    }).then(() => setReloadTables(true));
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
    }).then(() => setReloadTables(true));
  }

  /** function that opens the serach and puts something in the serach bar
   * @param {string} searchString string to put into the serach bar of the serach thingy
   */
  function openSearch(searchString) {
    setSearchOpen(true);

    setLocationDropDownOpen(false);
    setSearchOverwrite(searchString);
  }

  /** function that sets up everything for the new location (deletes old tables and stuff)
   * @param {number} id id of the new location
   */
  function changeLocation(id) {
    if (locationId === id) return;
    localStorage.setItem("raumplan", JSON.stringify({ location: id }));
    setMovingTable(false);
    setPopupOpen(false);
    setLocationId(id);
    setReloadTables(true);
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
        .then(() => {
          setMovingTableNewPos();
        })
        .then(resolve);
    });
  }
  function resetMovingTable() {
    setMovingTable(false);
    setMovingTableId(-1);
    setMovingTableNewPos({ x: 0, y: 0, r: 0 });
    setMovingTableOldPos({ x: 0, y: 0, r: 0 });
  }

  return (
    <>
      <ReactTooltip
        effect="solid"
        place={hoverTooltopPosition}
        offset={{ [hoverTooltopPosition]: 5 }}
      />
      <div id="app" className={CONFIG.darkmode ? "dark" : "light"}>
        <img src={images[locationData?.img] || ""} alt={"map"} id="map" />
        {teamlocations?.map((location, i) => (
          <Teamlocation
            key={i}
            openSearch={(s) => openSearch(s)}
            data={location}
          />
        ))}

        {rooms?.map((room, i) => (
          <Room
            key={i}
            data={room}
            highlighted={room.name === highlightedRoom}
            openCalender={(data) => setCalender({ visible: true, data: data })}
          />
        ))}

        {tables?.map((table, i) => {
          let draggableProps = {
            disabled: !(movingTable && table.id === movingTableId),
          };
          if (!draggableProps.disabled)
            draggableProps.position = { x: 0, y: 0 };

          return (
            <Draggable
              key={table.id}
              {...draggableProps}
              defaultPosition={{ x: 0, y: 0 }}
              onStop={(e, elem) => {
                setMovingTableNewPos({
                  x: movingTableNewPos.x + elem.x,
                  y: movingTableNewPos.y + elem.y,
                  r: movingTableNewPos.r,
                });
              }}
            >
              <div className="tableDraggable">
                <Table
                  highlighted={highlightedTable === table.id}
                  active={
                    table.id === tooltipTableId && (tooltipVisible || popupOpen)
                  }
                  locationData={locationData}
                  data={table}
                  tooltip={(visible) => setTooltipVisible(visible)}
                  changeTooltipTable={(id) => setTooltipTableId(id)}
                  popup={() => setPopupOpen(true)}
                  popupOpen={popupOpen}
                  moving={movingTable && table.id === movingTableId}
                  newPosition={movingTableNewPos}
                />
              </div>
            </Draggable>
          );
        })}
        <FloatingButtons
          images={images}
          searchOpen={searchOpen}
          setSearchOpen={(val) => {
            setSearchOpen(val);
          }}
          addTable={() => addTable()}
          setReloadTables={() => setReloadTables(true)}
          searchOverwrite={searchOverwrite}
          highlightRoom={(name) => setHighlightedRoom(name)}
          highlightTable={(id) => setHighlightedTable(id)}
          currentLocation={locationId}
          changeLocation={(id) => changeLocation(id)}
          clearOverwrite={() => setSearchOverwrite(false)}
          reloadTables={reloadTables}
          locationDropDownOpen={locationDropDownOpen}
          setlocationDropDownOpen={(val) => setLocationDropDownOpen(val)}
          setHighlightedTable={(table) => setHighlightedTable(table)}
          setHighlightedRoom={(room) => setHighlightedRoom(room)}
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
        />
        <Tooltip
          table={tables?.find((t) => t.id === tooltipTableId)}
          visible={tooltipVisible}
          popup={popupOpen}
          openPopup={() => setPopupOpen(true)}
          closePopup={() => setPopupOpen(false)}
          changeTableNumber={(id, num) => changeTableNumber(id, num)}
          removeTable={(id) => {
            if (!window.confirm("Tisch wirklich löschen?")) return;
            removeTable(id);
            setPopupOpen(false);
          }}
          // edit users
          deleteUser={(userId, tableId) => removeUserFromTable(userId, tableId)}
          addUserToTable={(tableId, userId) => addUserToTable(tableId, userId)}
          updateTables={() => setReloadTables(true)}
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
            setMovingTableOldPos({ x: 0, y: 0, r: 0 });
            setReloadTables(true);
          }}
          resetMovingTable={() => resetMovingTable()}
          ref={tooltipRef}
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
          openSearch={(name) => openSearch(name)}
          newRotation={movingTableNewPos.r}
          openUserPopup={(userId) => {
            setUserPopupOpen(true);
            setUserPopupUserId(userId);
          }}
        />
        <Calender
          data={calender.data}
          visible={calender.visible}
          close={() => setCalender({ ...calender, visible: false })}
        />
        <Userpopup
          userId={userPopupUserId}
          open={userPopupOpen}
          closePopup={() => setUserPopupOpen(false)}
          images={images}
        />
      </div>
    </>
  );
}

const Router = () => {
  const counter = useRef(10);
  const [refreshTimer, setRefreshTimer] = useState(counter.current);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error === false)
      try {
        fetchSync(process.env.REACT_APP_BACKEND + "ping");
      } catch (err) {
        setError(err);
        console.error(error);
        setInterval(() => {
          counter.current -= 1;
          setRefreshTimer(counter.current);
        }, 1000);
      }
  }, [error]);

  useEffect(() => {
    if (refreshTimer <= 0) window.location.reload();
  }, [refreshTimer]);

  if (error !== false)
    return (
      <div id="error">
        <div className="errorMessage">
          <h1>No connection to backend</h1>
          <code id="error">{error.toString()}</code>
          <h4>Bitte den Admin kontaktieren!</h4>
          <h5>erneut versuchen: {counter.current}</h5>
        </div>
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} exact />
        <Route path="/feedback" element={<FeedbackApp />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Router />);
