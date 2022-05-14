import { useEffect, useState } from "react";
import User from "./User";
// icons
import { BsDoorClosed } from "react-icons/bs";
import { GiTable } from "react-icons/gi";
import { GrGroup, GrLogout } from "react-icons/gr";
// helpers
import { addUsersToStorage } from "../helpers/users";
// css
import "../styles/searchMenu.scss";

export default function Searchmenu(props) {
  const [searchString, setSearchString] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    tables: [],
    teams: [],
    rooms: [],
    locations: [],
  });

  useEffect(() => {
    if (searchString === "") {
      setResults({
        users: [],
        tables: [],
        teams: [],
        rooms: [],
        locations: [],
      });
    } else {
      setLoading(true);
      if (
        searchString.includes("user: ") &&
        searchString.split("user: ").at(-1).trim() !== ""
      ) {
        fetch(
          process.env.REACT_APP_BACKEND +
            "getUsersByName/" +
            searchString.split("user: ").at(-1).trim()
        )
          .then((res) => res.json())
          .then((users) => {
            const tables = [];
            Promise.all(
              users.map(
                (user) =>
                  new Promise((resolve) =>
                    fetch(
                      process.env.REACT_APP_BACKEND + "usersTables/" + user.id
                    )
                      .then((res) => res.json())
                      .then((foundTables) => tables.push(foundTables))
                      .then(resolve)
                  )
              )
            ).then(() => {
              setResults({
                users: users,
                tables: tables.flat(),
                teams: [],
                rooms: [],
                locations: [],
              });
            });
          });
        setLoading(false);
      } else
        fetch(process.env.REACT_APP_BACKEND + "search/" + searchString.trim())
          .then((res) => res.json())
          .then((data) => setResults(data))
          .then(() => setLoading(false))
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
    }
  }, [searchString]);

  useEffect(() => {
    if (results.users.length > 0) addUsersToStorage(results.users);
  }, [results, props]);

  useEffect(() => {
    if (props.overwrite !== false) {
      setSearchString(props.overwrite);
      props.clearOverwrite();
    }
  }, [props]);

  return (
    <div id="searchInnerContainer" className={props.open ? "open" : ""}>
      <div className="wrapper">
        <div className="searchContainer">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchString}
            onChange={(e) => {
              setSearchString(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key !== "Enter") return;

              const item = [
                ...results.teams.map((l) => ({ ...l, type: "team" })),
                ...results.rooms.map((l) => ({ ...l, type: "room" })),
                ...results.locations.map((l) => ({ ...l, type: "location" })),
                ...results.users.map((l) => ({ ...l, type: "user" })),
                ...results.tables.map((l) => ({ ...l, type: "table" })),
              ][0];

              if (item === undefined) return;

              switch (item.type) {
                case "team":
                  setSearchString(item.name);
                  break;
                case "room":
                  props.changeLocation(item.location);
                  props.highlightRoom(item.name);
                  break;
                case "location":
                  props.changeLocation(item.id);
                  break;
                case "user":
                  setSearchString("user: " + item.Person);
                  break;
                case "table":
                  props.changeLocation(item.location);
                  props.highlightTable(item.id);
                  break;
                default:
                  console.warn(
                    `searched for: "${searchString}" but could not handle enter key click`
                  );
                  break;
              }
            }}
          />
          <div id="clearInput" onClick={() => setSearchString("")}>
            ✕
          </div>
        </div>
        <div className="results">
          {loading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : searchString === "" ? (
            <div className="info">
              Suche nach Personen, Tischen, Teams, Räumen und Locations{" "}
            </div>
          ) : Object.values(results).flat().length === 0 ? (
            <div className="noResults">nichts gefunden 😥</div>
          ) : (
            [
              results.teams.map((team, i) => (
                <div
                  key={"team" + team.id}
                  className="team"
                  onClick={() => setSearchString(team.name)}
                  style={{
                    background: team.color,
                    color:
                      parseInt(team.color.replace("#", ""), 16) > 0xffffff / 1.1
                        ? "black"
                        : "white",
                  }}
                >
                  {team.name}
                  <GrGroup />
                </div>
              )),

              results.rooms
                .filter((r) => r.name.length > 0)
                .map((room, i) => (
                  <div
                    className="room"
                    key={"room" + room.name + room.location}
                    onClick={() => {
                      props.changeLocation(room.location);
                      props.highlightRoom(room.name);
                    }}
                  >
                    <div style={{ background: room.color }}>
                      {room.name}
                      <BsDoorClosed />
                      {/* // icon when room is in different loaction */}
                      {room.location !== props.currentLocation ? (
                        <div className="diffLocation" title="anderer Standort">
                          <GrLogout />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                )),
              results.locations.map((location) => (
                <div
                  className="location"
                  key={location.name}
                  onClick={() => {
                    props.changeLocation(location.id);
                  }}
                >
                  {location.name}
                  <br />
                  <img
                    src={props.images[location.img] || ""}
                    alt={"picture of " + location.name}
                  />
                </div>
              )),
              results.users.map((user, i) => {
                return (
                  <User
                    key={"user" + user.id}
                    user={user}
                    clickable={true}
                    clickHandler={() => {
                      setSearchString("user: " + user.Person);
                    }}
                  />
                );
              }),
              results.tables
                .filter(
                  (table, i) =>
                    results.tables.map((t) => t.id).indexOf(table.id) === i
                )
                .map((table, i) => (
                  <div
                    className="table"
                    key={table.id}
                    onClick={() => {
                      props.changeLocation(table.location);
                      props.highlightTable(table.id);
                    }}
                  >
                    {table.tableNumber}
                    <GiTable />
                  </div>
                )),
            ]
          )}
        </div>
      </div>
    </div>
  );
}
