import React, { useState } from "react";
// import ReactDOM from "react-dom";
import Draggable from "react-draggable";

import User from "./User";
import AddUserForm from "./AddUserForm";

import "../styles/tooltip.scss";
// icons
import { BsTrashFill } from "react-icons/bs";
import { FiMove, FiCheck } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";

export default function Tooltip(props) {
  const [visible, setVisibility] = useState(false);
  const [addUserFormOpen, openUserForm] = useState(false);

  const myRef = React.createRef();

  const defaultValue = props.table?.tableNumber;
  const isDraggable = !props.popup
    ? {
        position: {
          x: props.table?.x + 80 || 0,
          y: props.table?.y - 40 || 0,
        },
      }
    : [];
  const userCount = (
    props.table?.user.split(";").filter((s) => s.length > 0) || []
  ).length;

  const hideButton = props.currentlyMovingTable
    ? {
        height: 0,
        width: 0,
        overflow: "hidden",
      }
    : {};

  return (
    <>
      <Draggable
        {...isDraggable}
        handle=".drag"
        cancel=".noDragHere"
        defaultClassNameDragging="dragging"
      >
        <div
          ref={myRef}
          // id="tooltip"
          className={"drag " + (props.popup ? "popup" : "")}
          {...{ id: "tooltip" }}
          style={{
            zIndex: props.popup || visible || props.visible ? 2 : -1,
            position: props.popup ? "fixed" : "relative",
            transform: props.popup ? "translate(-50%, -50%)" : "",
            transitionDelay: visible || props.visible ? "" : " .1s",
            opacity: props.popup || visible || props.visible ? 1 : 0,
          }}
          onMouseEnter={() => setVisibility(true)}
          onMouseLeave={() => setVisibility(false)}
        >
          <form
            action=""
            onSubmit={(e) => {
              e.target.children[0].blur();
              e.preventDefault();
            }}
            key={defaultValue}
          >
            <input
              type="text"
              id="tableNumber"
              defaultValue={defaultValue}
              autoComplete="off"
              disabled={!props.popup}
              onBlur={(e) => {
                props.changeTableNumber(props.table?.id, e.target.value);
                e.preventDefault();
              }}
            />
          </form>
          <div id="editButtonContainer">
            <button onClick={() => props.openPopup()}>
              <FaEdit />
            </button>
          </div>
          <div id="closeButtonContainer">
            <button onClick={() => props.closePopup()} style={hideButton}>
              <AiOutlineClose />
            </button>
          </div>
          <div
            key={props.table?.r}
            id="inputs"
            className={
              "noDragHere " + (props.currentlyMovingTable ? "" : "hidden")
            }
          >
            <h3>Tisch drehen / verschieben</h3>
            <input
              type="range"
              defaultValue={props.table?.r}
              name="posRinput"
              id="posR"
              min={0}
              max={360}
              onChange={(e) => props.spinTable(e.target.value)}
            />
            <h4>Schiebe den Tisch mit der Maus</h4>
          </div>
          <div
            id="usersContainer"
            className={props.currentlyMovingTable ? "hidden" : ""}
            style={{
              gridTemplateColumns: userCount > 1 ? "auto auto" : "auto",
              width: userCount < 2 ? 250 : userCount > 4 ? 600 : 420,
              justifyContent: userCount < 3 ? "center" : "flex-start",
            }}
          >
            {(
              props.table?.user.split(";").filter((s) => s.length > 0) || []
            ).map((user, i) => {
              const u = props.getUser(user);
              return (
                <div key={i} className="userContainer">
                  <User
                    deletable={true}
                    deleteUser={(userId) => {
                      const users = props.table.user.split(";");
                      users.splice(users.indexOf(userId), 1);
                      props.table.user = users.join(";");
                      props.deleteUser(userId, props.table?.id);
                    }}
                    getTeam={(name) => props.getTeam(name)}
                    key={i}
                    user={u}
                  />
                </div>
              );
            }) || <span className="noData">keine Personen</span>}
          </div>
          <div id="controls">
            <button
              id="add"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => openUserForm(true)}
            >
              <HiUserAdd />
            </button>
            <button
              id="save"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.saveMovedTable()}
            >
              <FiCheck />
            </button>
            <button
              id="move"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() =>
                props.moveTable(props.table?.id, {
                  x: props.table.x,
                  y: props.table.y,
                  r: props.table.r,
                })
              }
            >
              <FiMove />
            </button>
            <button
              id="reset"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.resetMovingTable()}
            >
              <GrPowerReset />
            </button>
            <button
              id="delete"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.removeTable(props.table?.id)}
            >
              <BsTrashFill />
            </button>
          </div>
        </div>
      </Draggable>
      <AddUserForm
        open={addUserFormOpen}
        addUser={(userId) => {
          props.addUserToTable(props.table.id, userId);
          props.table.user = props.table.user + ";" + userId;
        }}
        getTeam={(name) => props.getTeam(name)}
        closePopup={() => {
          openUserForm(false);
          props.updateTables();
        }}
      />
    </>
  );
}
