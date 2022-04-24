import React, { useState } from "react";
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
            .map((teamName) =>
              props.getTeam(teamName.replace(": Seibert Media (SM)", "").trim())
            )
            .flat(),
        };
      });

    setUserData(users);
    props.changeTooltipData(props.data, userData);
  }

  return (
    <div
      className="table"
      onClick={() => {
        props.popup();
      }}
      style={{
        height: props.height + "px",
        width: props.width + "px",
        fontSize: props.fontSize,
        top: props.data.y,
        left: props.data.x,
        transform: props.moving
          ? `rotate(${props.newRotation}deg)`
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
