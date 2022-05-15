import { useState, useEffect } from "react";
import { fetchLocationData, getLocationData } from "../helpers/locations";

export default function TableImage(props) {
  const [location, setLocation] = useState(
    getLocationData(props.table.location)
  );
  const [image, setImage] = useState(null);
  console.log(location);

  useEffect(() => {
    if (location !== undefined) return;
    fetchLocationData(props.table.location).then((location) =>
      setLocation(location)
    );
  }, [props.table.location]);

  useEffect(() => {
    if (location === undefined) return;
    console.log(props.images);
    setImage(props.images[location.img]);
  }, [location]);

  const height = 150,
    width = 200,
    scale = 0.9;

  return (
    <div
      className="tableImageContainer"
      style={{
        height: height + "px",
        width: width + "px",
      }}
    >
      {image ? (
        <>
          <img
            src={image}
            alt={"picture of a table on the table plan"}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${
                props.table.x + width / 2 - location.tableWidth / scale
              }px ${
                props.table.y + height / 2 - location.tableHeight / scale
              }px`,

              marginTop:
                -props.table.y + height / 2 - location.tableHeight / 2 + "px",
              marginLeft:
                -props.table.x + width / 2 - location.tableWidth / 2 + "px",
            }}
          />
          <div
            className="table"
            style={{
              transform: `scale(${scale})`,
              height: location.tableHeight + "px",
              width: location.tableWidth + "px",
              marginTop: -location.tableHeight / 2 + "px",
              marginLeft: -location.tableWidth / 2 + "px",
            }}
          >
            {props.table.tableNumber.slice(-3)}
          </div>
        </>
      ) : (
        <div className="tableImagePlaceholder">TODO: loading spinner</div>
      )}
    </div>
  );
}
