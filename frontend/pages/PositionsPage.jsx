import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  fetchVehicles,
  recordPosition,
  fetchHistoryWithFilters
} from "../services/api";

const DEFAULT_CENTER = [48.8566, 2.3522];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function PositionsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [recordedAt, setRecordedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Historique
  const [histVehicleId, setHistVehicleId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(500);
  const [track, setTrack] = useState([]);
  const [trackPositions, setTrackPositions] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState("");

  useEffect(() => {
    fetchVehicles().then(setVehicles).catch(() => {});
  }, []);

  // Géolocalisation navigateur
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setSubmitError("Géolocalisation non supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => setSubmitError("Impossible d'obtenir la position.")
    );
  };

  const handleRecord = async () => {
    if (!selectedVehicleId || !lat || !lng) {
      setSubmitError("Véhicule, latitude et longitude requis.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await recordPosition({
        vehicle_id: Number(selectedVehicleId),
        lat: Number(lat),
        lng: Number(lng),
        recorded_at: recordedAt || undefined
      });
      setSubmitSuccess("✅ Position enregistrée !");
      setLat("");
      setLng("");
      setRecordedAt("");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Erreur enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!histVehicleId) {
      setHistError("Sélectionne un véhicule.");
      return;
    }
    setHistLoading(true);
    setHistError("");
    setTrack([]);
    setTrackPositions([]);
    try {
      const positions = await fetchHistoryWithFilters(histVehicleId, {
        from: fromDate || undefined,
        to: toDate || undefined,
        limit
      });
      setTrackPositions(positions);
      setTrack(positions.map((p) => [p.lat, p.lng]));
    } catch (err) {
      setHistError(err.response?.data?.message || "Erreur chargement historique.");
    } finally {
      setHistLoading(false);
    }
  };

  const mapCenter = track.length > 0 ? track[0] : DEFAULT_CENTER;
  const selectedVehicle = vehicles.find((v) => v.id === Number(histVehicleId));

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#e5e7eb" }}>
        📍 Positions GPS
      </h2>

      {/* Enregistrement */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "#e5e7eb" }}>
          ➕ Enregistrer une position
        </h3>

        <div className="field">
          <label>Véhicule</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            style={{
              width: "100%", padding: "0.45rem 0.7rem", borderRadius: "6px",
              background: "#1f2937", border: "1px solid #374151",
              color: "#e5e7eb", fontSize: "0.9rem"
            }}
          >
            <option value="">-- Sélectionner --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="48.8566"
              step="0.000001"
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="2.3522"
              step="0.000001"
            />
          </div>
        </div>

        <div className="field">
          <label>Date/heure (optionnel)</label>
          <input
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            style={{ background: "#1f2937", border: "1px solid #374151", color: "#e5e7eb" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button className="btn btn-outline" onClick={handleGeolocate} style={{ fontSize: "0.85rem" }}>
             Ma position
          </button>
          <button className="btn" onClick={handleRecord} disabled={submitting} style={{ flex: 1 }}>
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        {submitError && <div className="error" style={{ marginTop: "0.5rem" }}>{submitError}</div>}
        {submitSuccess && (
          <div style={{ marginTop: "0.5rem", color: "#22c55e", fontSize: "0.85rem" }}>{submitSuccess}</div>
        )}
      </div>

      {/* Historique */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "#e5e7eb" }}>
          🗓️ Historique de trajet
        </h3>

        <div className="field">
          <label>Véhicule</label>
          <select
            value={histVehicleId}
            onChange={(e) => setHistVehicleId(e.target.value)}
            style={{
              width: "100%", padding: "0.45rem 0.7rem", borderRadius: "6px",
              background: "#1f2937", border: "1px solid #374151",
              color: "#e5e7eb", fontSize: "0.9rem"
            }}
          >
            <option value="">-- Sélectionner --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Depuis</label>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ background: "#1f2937", border: "1px solid #374151", color: "#e5e7eb" }}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Jusqu'à</label>
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ background: "#1f2937", border: "1px solid #374151", color: "#e5e7eb" }}
            />
          </div>
        </div>

        <div className="field">
          <label>Limite de points ({limit})</label>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <button
          className="btn"
          onClick={handleLoadHistory}
          disabled={histLoading}
          style={{ width: "100%" }}
        >
          {histLoading ? "Chargement..." : "Afficher le trajet"}
        </button>

        {histError && <div className="error" style={{ marginTop: "0.5rem" }}>{histError}</div>}

        {trackPositions.length > 0 && (
          <div style={{ marginTop: "0.8rem", fontSize: "0.82rem", color: "#9ca3af" }}>
            {trackPositions.length} point{trackPositions.length > 1 ? "s" : ""} •{" "}
            {new Date(trackPositions[0].recorded_at).toLocaleString()} →{" "}
            {new Date(trackPositions[trackPositions.length - 1].recorded_at).toLocaleString()}
          </div>
        )}
      </div>

      {/* Carte historique */}
      {track.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "#e5e7eb" }}>
            🗺️ Trajet — {selectedVehicle?.name}
          </h3>
          <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={track} color="#22c55e" weight={4} />
              {/* Point de départ */}
              <Marker position={track[0]} icon={markerIcon}>
                <Popup>
                  <strong>Départ</strong><br />
                  {new Date(trackPositions[0].recorded_at).toLocaleString()}
                </Popup>
              </Marker>
              {/* Point d'arrivée */}
              <Marker position={track[track.length - 1]} icon={markerIcon}>
                <Popup>
                  <strong>Arrivée</strong><br />
                  {new Date(trackPositions[trackPositions.length - 1].recorded_at).toLocaleString()}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionsPage;