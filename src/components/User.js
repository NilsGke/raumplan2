import React from "react";
// icons
import { BsTrashFill } from "react-icons/bs";

export default class User extends React.Component {
  render() {
    this.teams = this.props.user.Organisationseinheiten.split(",").map((t) =>
      this.props.getTeam(t.replace(": Seibert Media (SM)", "").trim())
    );
    return (
      <div
        className="user"
        onClick={() => {
          if (this.props.clickable) this.props.clickHandler(this.props.user.id);
        }}
      >
        <h3>{this.props.user.Person}</h3>
        {this.props.deletable ? (
          <div
            onClick={() => {
              this.props.deleteUser(this.props.user.id);
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
        <h4>{this.props.user.Anmeldename.toLowerCase()}</h4>
        <div
          className="teams"
          style={{
            gridTemplateColumns: this.teams.length > 2 ? "auto auto" : "auto",
          }}
        >
          {this.teams.map((team, i) => {
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
}
