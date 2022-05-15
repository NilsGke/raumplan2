import React, { useState, useImperativeHandle, forwardRef } from "react";
import Draggable from "react-draggable";

import User from "./Userid";
import AddUserForm from "./AddUserForm";

import "../styles/tooltip.scss";
// icons
import { BsTrashFill } from "react-icons/bs";
import { FiMove, FiCheck } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";

const Tooltip = forwardRef((props, ref) => {
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

  useImperativeHandle(ref, () => ({
    closeAddUserForm() {
      openUserForm(false);
    },
    addUserFormOpen: addUserFormOpen,
  }));

  const hideButton = props.currentlyMovingTable
    ? {
        height: 0,
        width: 0,
        overflow: "hidden",
      }
    : {};

  const userIds =
    props.table?.user.split(";").filter((s) => s.length > 0) || [];

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
              className="noDragHere"
              defaultValue={defaultValue}
              autoComplete="off"
              disabled={!props.popup}
              onBlur={(e) => {
                props.changeTableNumber(props.table?.id, e.target.value);
                e.preventDefault();
              }}
            />
          </form>
          <div
            id="editButtonContainer"
            className="noDragHere"
            data-tip={"Bearbeiten"}
            onMouseOver={() => props.setHoverTooltopPosition("left")}
          >
            <button
              onClick={() => props.openPopup()}
              // onTouchStart={() => props.openPopup()}
              className="noDragHere"
            >
              <FaEdit />
            </button>
          </div>
          <div id="closeButtonContainer">
            <button
              onClick={() => props.closePopup()}
              className="noDragHere"
              style={hideButton}
            >
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
            <h4>{props.newRotation || props.table?.r}°</h4>
            <div id="rotateTableInput" className="noDragHere">
              <button
                className="noDragHere"
                onClick={() => {
                  if (props.newRotation === 0) return;
                  props.spinTable(props.newRotation - 1);
                }}
              >
                −
              </button>
              <input
                className="noDragHere"
                type="range"
                defaultValue={props.newRotation || props.table?.r}
                name="posRinput"
                id="posR"
                min={0}
                max={360}
                onChange={(e) => props.spinTable(parseInt(e.target.value))}
              />
              <button
                className="noDragHere"
                onClick={() => {
                  if (props.newRotation === 360) return;
                  props.spinTable(props.newRotation + 1);
                }}
              >
                +
              </button>
            </div>
            <h5>Schiebe den Tisch mit der Maus oder den Pfeiltasten</h5>
          </div>
          <div
            id="usersContainer"
            className={
              "noDragHere" + (props.currentlyMovingTable ? " hidden" : "")
            }
            style={{
              gridTemplateColumns: userIds.length > 1 ? "auto auto" : "auto",
              width: userIds.length < 2 ? 250 : userIds.length > 4 ? 600 : 420,
              justifyContent: userIds.length < 3 ? "center" : "flex-start",
            }}
          >
            {userIds.map((userId, i) => (
              <div key={userId} className="userContainer">
                <User
                  id={userId}
                  deletable={true}
                  deleteUser={() => {
                    // remove user from table in database
                    props.deleteUser(userId, props.table?.id);
                    // remove user from this table element (might fix some time, so tables get reloaded) FIXME:
                    const users = props.table.user.split(";");
                    users.splice(users.indexOf(userId), 1);
                    props.table.user = users.join(";");
                  }}
                  clickable={true}
                  clickHandler={({ Person }) => {
                    props.openSearch("user: " + Person);
                  }}
                  openUserPopup={(id) => props.openUserPopup(id)}
                />
              </div>
            )) || <span className="noData">keine Personen</span>}
          </div>
          <div
            id="controls"
            className="noDragHere"
            onMouseOver={() => props.setHoverTooltopPosition("bottom")}
          >
            <button
              id="add"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => openUserForm(true)}
              data-tip={"Person hinzufügen"}
            >
              <HiUserAdd />
            </button>
            <button
              id="save"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.saveMovedTable()}
              data-tip={"Speichern"}
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
              data-tip="verschieben / drehen"
            >
              <FiMove />
            </button>
            <button
              id="reset"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.resetMovingTable()}
              data-tip={"Abbrechen"}
            >
              <GrPowerReset />
            </button>
            <button
              id="delete"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.removeTable(props.table?.id)}
              data-tip={"Löschen"}
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
});

export default Tooltip;
