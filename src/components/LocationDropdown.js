import React, { useEffect, useRef } from "react";
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

  const useFocus = () => {
    const htmlElRef = useRef(null);
    const setFocus = () => {
      htmlElRef.current && htmlElRef.current.focus();
    };

    return [htmlElRef, setFocus];
  };
  const [inputRef, setInputFocus] = useFocus();

  useEffect(setInputFocus);

  return (
    <div id="locationDropdownContainer" className={props.open ? "open" : ""}>
      <div id="locationDropdown">
        {(allLocations || []).map((l, i) => {
          let focusRef;
          if (props.open && props.currentLocation === i)
            focusRef = { ref: inputRef };
          return (
            <button
              key={i}
              className={
                "location " + (props.currentLocation === i ? "current" : "")
              }
              {...focusRef}
              onClick={() => props.changeLocation(i)}
            >
              {l.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
