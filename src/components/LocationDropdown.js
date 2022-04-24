import React from "react";
import "../styles/locationDropdown.scss";

export default function LocationDropdown(props) {
  return (
    <div id="locationDropdownContainer" className={props.open ? "open" : ""}>
      <div id="locationDropdown">
        {props.locations?.map((l, i) => (
          <button
            key={i}
            className={
              "location " + (props.currentLocation === i ? "current" : "")
            }
            onClick={() => props.changeLocation(i)}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
