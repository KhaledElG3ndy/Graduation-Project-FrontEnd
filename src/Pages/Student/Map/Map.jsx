import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MapData from "./MapData";
import styles from "./Map.module.css";
import Header from "../../../components/Student/Header/Header";
const Map = () => {
  const [coordinates, setCoordinates] = useState(null);

  const handleGoToGoogleMaps = (coords) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    window.location.href = googleMapsUrl;
  };

  const handleLocationSelect = (coords) => {
    setCoordinates(coords);
    handleGoToGoogleMaps(coords);
  };

  return (
    <>
      <Header />
      <Sidebar onLocationSelect={handleLocationSelect}>
        <MapData coordinates={coordinates} />
        <button
          className={styles.mapButton}
          onClick={() => handleGoToGoogleMaps(coordinates)}
        >
          View in Google Maps
        </button>
      </Sidebar>
    </>
  );
};

export default Map;
