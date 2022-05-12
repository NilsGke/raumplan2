import { useEffect, useState } from "react";
import User from "./Userid";
// icons
import { BsDoorClosed } from "react-icons/bs";
import { GiTable } from "react-icons/gi";
import { GrGroup } from "react-icons/gr";
// helpers
import { addUsers } from "../helpers/users";
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
          .then((data) => setLoading(false))
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
    }
  }, [searchString]);

  useEffect(() => {
    if (results.users.length > 0) addUsers(results.users);
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
              results.users.map((user, i) => (
                <User
                  key={"user" + user.id}
                  id={user.id}
                  getTeam={props.getTeam}
                  clickable={true}
                  clickHandler={() => {
                    setSearchString("user: " + user.Person);
                  }}
                />
              )),
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
