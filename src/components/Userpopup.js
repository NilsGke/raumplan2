import React, { useState, useEffect } from "react";
import { fetchUserData } from "../helpers/users";
import { getUserData } from "../helpers/users";
// components
import Team from "./Team";
import TableImage from "./TableImage";
// icons
import { AiOutlineClose } from "react-icons/ai";
// styles
import "../styles/userpopup.scss";

export default function Userpopup(props) {
  const [user, setUser] = useState(getUserData(props.userId));
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (props.userId === null) return;
    const newUser = getUserData(props.userId);
    if (newUser === undefined)
      fetchUserData(props.userId).then((user) => setUser(user));
    else setUser(newUser);
  }, [props.userId]);

  useEffect(() => {
    if (user === null) return;
    fetch(process.env.REACT_APP_BACKEND + "usersTables/" + props.userId)
      .then((t) => t.json())
      .then((tables) => setTables(tables));
  }, [user]);

  const teams =
    user?.Organisationseinheiten.split(",").map((t) =>
      t.replace(": Seibert Media (SM)", "").trim()
    ) || [];

  return (
    <div className={"userpopup" + (props.open ? " open" : "")}>
      <div className={"userpopup-content"}>
        <div className="userpopup-header">
          <h3>{user?.Person}</h3>
          <button
            className="userpopup-close-button"
            onClick={() => props.closePopup()}
          >
            <AiOutlineClose />
          </button>
        </div>
        <div className="userpopup-body">
          <div className="userpopup-screenshots">
            {tables.map((t) => (
              <>
                <span>{t.tableNumber}</span>
                <TableImage images={props.images} key={t.id} table={t} />
              </>
            ))}
          </div>
          <div className="userpopup-teams">
            {teams.map((t) => (
              <Team key={t} name={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
