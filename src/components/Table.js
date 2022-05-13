import React from "react";
import "../styles/table.scss";

export default function Table(props) {
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
        height: props.locationData.tableHeight + "px",
        width: props.locationData.tableWidth + "px",
        fontSize: props.locationData.fontSize,
        top: props.moving ? props.data.y + props.newPosition.y : props.data.y,
        left: props.moving ? props.data.x + props.newPosition.x : props.data.x,
        transform: props.moving
          ? `rotate(${props.newPosition.r}deg)`
          : `rotate(${props.data.r}deg)`,
      }}
      onMouseEnter={() => {
        if (props.popupOpen) return;
        props.tooltip(true);
        props.changeTooltipTable(props.data.id);
      }}
      onMouseLeave={() => {
        props.tooltip(false);
      }}
    >
      {props.data.tableNumber.substr(-3, 3)}
    </div>
  );
}
