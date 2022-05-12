import React, { useState } from "react";
import "../styles/table.scss";
// const fetch = require("sync-fetch");

export default function Table(props) {
  const [userData, setUserData] = useState(false);

  function fetchUsers(userIDs) {
    const users = userIDs
      // .map((id) => fetch(process.env.REACT_APP_BACKEND + "users/" + id).json())
      .map((id) => props.getUser(id))
      .flat()
      .map((user) => {
        return {
          ...user,
          teams: user.Organisationseinheiten.split(", ")
            .map((teamName) => {
              try {
                return props.getTeam(
                  teamName.replace(": Seibert Media (SM)", "").trim()
                );
              } catch (error) {
                console.warn(error);
              }
              return null;
            })
            .flat(),
        };
      });

    setUserData(users);
    props.changeTooltipData(props.data, userData);
  }

  return (
    <div
      className={
        "table " +
        (props.active ? " active " : "") +
        (props.highlighted ? " highlighted " : "")
      }
      onClick={(e) => {
        if (e.nativeEvent.pointerType === "touch") return; // dont open popup if touched on mobile (thats what the edit button is for)
        props.popup();
      }}
      style={{
        height: props.height + "px",
        width: props.width + "px",
        fontSize: props.fontSize,
        top: props.moving ? props.data.y + props.newPosition.y : props.data.y,
        left: props.moving ? props.data.x + props.newPosition.x : props.data.x,
        transform: props.moving
          ? `rotate(${props.newPosition.r}deg)`
          : `rotate(${props.data.r}deg)`,
      }}
      onMouseEnter={() => {
        if (props.popupOpen) return;
        props.tooltip(true);
        if (!userData) {
          fetchUsers(props.data.user.split(";").filter((s) => s.length > 0));
        } else {
          props.changeTooltipData(props.data, userData);
        }
      }}
      onMouseLeave={() => {
        props.tooltip(false);
      }}
    >
      {props.data.tableNumber.substr(-3, 3)}
    </div>
  );
}
