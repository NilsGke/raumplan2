import React from "react";
// icons
import { BsTrashFill } from "react-icons/bs";

export default function User(props) {
  const teams = props.user.Organisationseinheiten.split(",").map((t) =>
    props.getTeam(t.replace(": Seibert Media (SM)", "").trim())
  );
  return (
    <div
      className="user"
      onClick={() => {
        if (props.clickable) props.clickHandler(props.user.id);
      }}
    >
      <h3>{props.user.Person}</h3>
      {props.deletable ? (
        <div
          onClick={() => {
            props.deleteUser(props.user.id);
          }}
          className="removeUserContainer"
        >
          <button className="removeUser">
            <BsTrashFill />
          </button>
        </div>
      ) : (
        ""
      )}
      <h4>{props.user.Anmeldename.toLowerCase()}</h4>
      <div
        className="teams"
        style={{
          gridTemplateColumns: teams.length > 2 ? "auto auto" : "auto",
        }}
      >
        {teams.map((team, i) => {
          return (
            <div
              key={i}
              className="team"
              style={{
                background: team.color,
                color:
                  parseInt(team.color.replace("#", ""), 16) > 0xffffff / 1.1
                    ? "black"
                    : "white",
              }}
            >
              {team.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
