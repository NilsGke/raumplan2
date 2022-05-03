import React from "react";
import "../styles/locationDropdown.scss";
const fetchSync = require("sync-fetch");

let allLocations = [];
let gotAllLocations = false;
export default function LocationDropdown(props) {
  if (props.open && !gotAllLocations) {
    allLocations = fetchSync(
      process.env.REACT_APP_BACKEND + "locations/"
    ).json();
    gotAllLocations = true;
  }
  return (
    <div id="locationDropdownContainer" className={props.open ? "open" : ""}>
      <div id="locationDropdown">
        {props.open
          ? (allLocations || []).map((l, i) => (
              <button
                key={i}
                className={
                  "location " + (props.currentLocation === i ? "current" : "")
                }
                onClick={() => props.changeLocation(i)}
              >
                {l.name}
              </button>
            ))
          : ""}
      </div>
    </div>
  );
}
