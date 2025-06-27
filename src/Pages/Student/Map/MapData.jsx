"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import styles from "./Map.module.css";

const MapData = ({ coordinates }) => {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
      iconUrl: "leaflet/images/marker-icon.png",
      shadowUrl: "leaflet/images/marker-shadow.png",
    });
  }, []);

  const bounds = [
    [27.17, 31.16],
    [27.195, 31.185],
  ];

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        bounds={bounds}
        className={styles.map}
        zoom={19}
        center={
          coordinates
            ? [coordinates.lat, coordinates.lng]
            : [27.185855, 31.16843]
        }
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates && (
          <Marker position={[coordinates.lat, coordinates.lng]}>
            <Popup>
              Building coordinates: {coordinates.lat}, {coordinates.lng}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapData;
