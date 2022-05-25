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
import FeedbackApp from "./pages/feedback";
// helpers
import {
  addOrRefreshTables,
  createNewTable,
  getTablesAtLocation,
} from "./helpers/tables";
import setColorTheme from "./helpers/theme";
const fetchSync = require("sync-fetch");

export const CONFIG = {
  reload: 0, // refresh time in seconds
  minSearchLengh: 0,
};

function importImages(r) {
  let images = {};
  r.keys().map((item, index) => {
    return (images[item.replace("./", "")] = r(item));
  });
  return images;
}

setColorTheme();

/**variable to hold locations*/
let locations = [];

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

  // teams and rooms on the map
  const [teamlocations, setTeamlocations] = useState(null);
  const [rooms, setRooms] = useState(null);

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

  /**holds images of the building*/
  const images = importImages(
    require.context("./img", false, /\.(png|jpe?g|svg)$/)
  );

  const tooltipRef = useRef();
  const calenderRef = useRef();
  const floatingButtonsRef = useRef();

  // reload interval
  useEffect(() => {
    if (CONFIG.reload > 0 && interval === null)
      interval = setInterval(() => setReloadTables(true), CONFIG.reload * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
        addOrRefreshTables(locationId).then(() =>
          setTables(getTablesAtLocation(locationId))
        );
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
            floatingButtonsRef.current.openSearchmenu();
            e.preventDefault();
            break;
          case "l":
            floatingButtonsRef.current.openLocationDropdown();
            e.preventDefault();
            break;
          case "n":
            createNewTable(locationId).then(() => setReloadTables(true));
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
        if (calenderRef.current.isOpen) calenderRef.current.closeCalender();
        else if (tooltipRef.current.addUserFormRef.current.open)
          tooltipRef.current.addUserFormRef.current.setOpen(false);
        else if (movingTable) resetMovingTable();
        else if (tooltipRef.current.isPopup)
          tooltipRef.current.setIsPopup(false);
        else if (tooltipRef.current.visible)
          tooltipRef.current.setVisible(false);
        else if (
          floatingButtonsRef.current.searchmenuRef.current.isOpen ||
          floatingButtonsRef.current.locationDropdownRef.current.isOpen
        ) {
          floatingButtonsRef.current.clearButtonBorders();
          floatingButtonsRef.current.searchmenuRef.current.setOpen(false);
          floatingButtonsRef.current.locationDropdownRef.current.setOpen(false);
        } else if (floatingButtonsRef.current.toggledOpen) {
          floatingButtonsRef.current.setToggledOpen(false);
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
        } else if (
          floatingButtonsRef.current.locationDropdownRef.current.isOpen
        ) {
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
    [
      movingTable,
      movingTable,
      movingTableNewPos,
      setMovingTableNewPos,
      changeLocation,
    ]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  /** function that sets up everything for the new location (deletes old tables and stuff)
   * @param {number} id id of the new location
   */
  function changeLocation(id) {
    if (locationId === id) return;
    localStorage.setItem("raumplan", JSON.stringify({ location: id }));
    setMovingTable(false);
    tooltipRef.current.setVisible(false);
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
      <div id="app">
        <img src={images[locationData?.img] || ""} alt={"map"} id="map" />
        {teamlocations?.map((location, i) => (
          <Teamlocation
            key={i}
            openSearch={(s) => {
              floatingButtonsRef.current.openSearchmenu();
              floatingButtonsRef.current.searchmenuRef.current.setSearchString(
                s
              );
            }}
            data={location}
          />
        ))}

        {rooms?.map((room, i) => (
          <Room
            key={i}
            data={room}
            highlighted={room.name === highlightedRoom}
            openCalender={(data) => {
              calenderRef.current.openCalender(data);
              calenderRef.current.setData(data);
            }}
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
                  locationData={locationData}
                  data={table}
                  setTooltipVisible={(bool) =>
                    tooltipRef.current.setVisible(bool)
                  }
                  changeTooltipTable={(id) => tooltipRef.current.setTable(id)}
                  openPopup={() => tooltipRef.current.setIsPopup(true)}
                  moving={movingTable && table.id === movingTableId}
                  newPosition={movingTableNewPos}
                />
              </div>
            </Draggable>
          );
        })}
        <FloatingButtons
          ref={floatingButtonsRef}
          images={images}
          setReloadTables={() => setReloadTables(true)}
          highlightRoom={(name) => setHighlightedRoom(name)}
          highlightTable={(id) => setHighlightedTable(id)}
          currentLocation={locationId}
          changeLocation={(id) => changeLocation(id)}
          reloadTables={reloadTables}
          setHighlightedTable={(table) => setHighlightedTable(table)}
          setHighlightedRoom={(room) => setHighlightedRoom(room)}
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
        />
        <Tooltip
          // edit users
          setReloadTables={() => setReloadTables(true)}
          updateTables={() => setReloadTables(true)}
          // move table
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
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
          openSearch={(searchString) => {
            floatingButtonsRef.current.searchmenuRef.current.setOpen(true);
            floatingButtonsRef.current.searchmenuRef.current.setSearchString(
              searchString
            );
          }}
          newRotation={movingTableNewPos.r}
          ref={tooltipRef}
        />
        <Calender ref={calenderRef} />
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
