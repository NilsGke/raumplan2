import "../styles/room.scss";

export default function Room(props) {
  return (
    <div
      className={"room " + (props.highlighted ? "highlighted" : "")}
      style={{
        top: props.data.y,
        left: props.data.x,
        height: props.data.h,
        width: props.data.w,
        background: props.data.color,
        fontSize: props.data.fontSize,
        cursor: props.data.link !== "" ? "pointer" : "auto",
      }}
      onClick={() => {
        if (props.data.link !== "") props.openCalender(props.data);
      }}
    >
      {props.data.name}
    </div>
  );
}

// TODO: onlick opens search with only that team
