import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import {
  fetchVehicles,
  fetchLatestPositionsAll,
  fetchHistoryForVehicle,
  searchWithinRadius,
  searchNearest
} from "../services/api";

const DEFAULT_CENTER = [48.8566, 2.3522];

const vehicleIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const searchIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "search-marker"
});

// Composant pour capturer les clics sur la carte
function MapClickHandler({ onMapClick, searchMode }) {
  useMapEvents({
    click(e) {
      if (searchMode) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

function DashboardPage() {
  const [vehicles, setVehicles] = useState([]);
  const [latestPositions, setLatestPositions] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [track, setTrack] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search state
  const [searchMode, setSearchMode] = useState(null); // "radius" | "nearest" | null
  const [searchPoint, setSearchPoint] = useState(null);
  const [radiusM, setRadiusM] = useState(1000);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const mapCenter = useMemo(() => {
    if (latestPositions.length > 0) {
      return [latestPositions[0].lat, latestPositions[0].lng];
    }
    return DEFAULT_CENTER;
  }, [latestPositions]);

  const loadVehiclesAndPositions = async () => {
    try {
      setError("");
      const [vehiclesData, positionsData] = await Promise.all([
        fetchVehicles(),
        fetchLatestPositionsAll()
      ]);
      setVehicles(vehiclesData);
      setLatestPositions(positionsData || []);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const loadTrackForVehicle = async (vehicleId) => {
    try {
      const positions = await fetchHistoryForVehicle(vehicleId, { limit: 500 });
      setTrack(positions.map((p) => [p.lat, p.lng]));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur trajectoire.");
    }
  };

  useEffect(() => {
    loadVehiclesAndPositions();
    const interval = setInterval(loadVehiclesAndPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedVehicleId) loadTrackForVehicle(selectedVehicleId);
    else setTrack([]);
  }, [selectedVehicleId]);

  const latestByVehicleId = useMemo(() => {
    const map = new Map();
    latestPositions.forEach((p) => map.set(p.vehicle_id, p));
    return map;
  }, [latestPositions]);

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId((current) => current === vehicleId ? null : vehicleId);
  };

  const handleMapClick = async (latlng) => {
    setSearchPoint(latlng);
    setSearchResults([]);
    setSearchError("");
    setSearchLoading(true);
    try {
      if (searchMode === "radius") {
        const results = await searchWithinRadius({
          lat: latlng.lat,
          lng: latlng.lng,
          radius_m: radiusM
        });
        setSearchResults(results || []);
      } else if (searchMode === "nearest") {
        const result = await searchNearest({ lat: latlng.lat, lng: latlng.lng });
        setSearchResults(result ? [result] : []);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || "Erreur de recherche.");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchMode(null);
    setSearchPoint(null);
    setSearchResults([]);
    setSearchError("");
  };

  return (
    <div className="dashboard-layout">
      {/* Panel gauche */}
      <section className="panel">
        <div className="panel-header">
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Véhicules</h2>
          <span className="badge">
            {vehicles.length} suivi{vehicles.length > 1 ? "s" : ""}
          </span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
          Cliquez sur un véhicule pour afficher sa trajectoire récente.
        </p>

        {/* Recherche géographique */}
        <div style={{ marginBottom: "1rem", borderTop: "1px solid #1f2937", paddingTop: "0.8rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.5rem" }}>
            🔍 Recherche géographique
          </div>

          {/* Rayon */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Rayon (mètres)
            </label>
            <input
              type="number"
              value={radiusM}
              onChange={(e) => setRadiusM(Number(e.target.value))}
              min={100}
              max={500000}
              style={{
                width: "100%", padding: "0.3rem 0.5rem", borderRadius: "6px",
                background: "#1f2937", border: "1px solid #374151",
                color: "#e5e7eb", fontSize: "0.82rem", marginTop: "0.2rem"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              className={`btn ${searchMode === "radius" ? "" : "btn-outline"}`}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              onClick={() => setSearchMode(searchMode === "radius" ? null : "radius")}
            >
              📍 Dans un rayon
            </button>
            <button
              className={`btn ${searchMode === "nearest" ? "" : "btn-outline"}`}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              onClick={() => setSearchMode(searchMode === "nearest" ? null : "nearest")}
            >
               Plus proche
            </button>
            {searchMode && (
              <button
                className="btn btn-outline"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                onClick={clearSearch}
              >
                ✕ Effacer
              </button>
            )}
          </div>

          {searchMode && (
            <p style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.4rem" }}>
              {searchMode === "radius"
                ? `Cliquez sur la carte pour chercher dans un rayon de ${radiusM}m`
                : "Cliquez sur la carte pour trouver le véhicule le plus proche"}
            </p>
          )}

          {searchLoading && (
            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Recherche...</p>
          )}

          {searchError && (
            <div className="error" style={{ fontSize: "0.75rem" }}>{searchError}</div>
          )}

          {searchResults.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#22c55e", marginBottom: "0.3rem" }}>
                {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}
              </div>
              {searchResults.map((v) => (
                <div
                  key={v.id}
                  className="vehicle-item"
                  onClick={() => handleSelectVehicle(v.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSelectVehicle(v.id); }}
                >
                  <div>
                    <div style={{ fontSize: "0.82rem" }}>{v.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{v.plate_number}</div>
                  </div>
                  {v.distance_m && (
                    <div style={{ fontSize: "0.72rem", color: "#a5b4fc" }}>
                      {v.distance_m < 1000
                        ? `${Math.round(v.distance_m)}m`
                        : `${(v.distance_m / 1000).toFixed(1)}km`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchPoint && !searchLoading && !searchError && (
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.3rem" }}>
              Aucun véhicule trouvé.
            </p>
          )}
        </div>

        {/* Liste véhicules */}
        <div className="vehicles-list">
          {vehicles.map((v) => {
            const latest = latestByVehicleId.get(v.id);
            const isActive = selectedVehicleId === v.id;
            return (
              <div
                key={v.id}
                className={"vehicle-item" + (isActive ? " vehicle-item--active" : "")}
                onClick={() => handleSelectVehicle(v.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") handleSelectVehicle(v.id); }}
              >
                <div>
                  <div>{v.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "0.05rem" }}>
                    {v.plate_number}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {latest ? (
                    <>
                      <div style={{ fontSize: "0.75rem", color: "#a5b4fc" }}>
                        {latest.lat.toFixed(4)}, {latest.lng.toFixed(4)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                        {new Date(latest.recorded_at).toLocaleTimeString()}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Aucune position</span>
                  )}
                </div>
              </div>
            );
          })}
          {vehicles.length === 0 && !loading && (
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Aucun véhicule enregistré. Utilisez l'API <code>/api/vehicles</code> pour en créer.
            </p>
          )}
        </div>
        {error && <div className="error">{error}</div>}
      </section>

      {/* Carte */}
      <section className="panel">
        <div className="map-toolbar">
          <div>
            <span style={{ fontWeight: 500 }}>Carte en temps réel</span>{" "}
            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>· mise à jour toutes les 5 s</span>
          </div>
          <div className="pill">
            {lastUpdatedAt
              ? `Dernière mise à jour : ${lastUpdatedAt.toLocaleTimeString()}`
              : "Chargement..."}
          </div>
        </div>
        <div className="map-wrapper">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} searchMode={searchMode} />

            {/* Marqueurs véhicules */}
            {latestPositions.map((p) => {
              const v = vehicles.find((veh) => veh.id === p.vehicle_id);
              if (!v) return null;
              return (
                <Marker
                  key={p.vehicle_id}
                  position={[p.lat, p.lng]}
                  icon={vehicleIcon}
                  eventHandlers={{ click: () => handleSelectVehicle(p.vehicle_id) }}
                >
                  <Popup>
                    <div style={{ fontSize: "0.85rem" }}>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div>{v.plate_number}</div>
                      <div style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "#6b7280" }}>
                        {p.lat.toFixed(5)}, {p.lng.toFixed(5)}<br />
                        {new Date(p.recorded_at).toLocaleString()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Trajectoire */}
            {track.length > 1 && (
              <Polyline positions={track} color="#22c55e" weight={4} />
            )}

            {/* Point de recherche + cercle rayon */}
            {searchPoint && (
              <>
                <Marker position={searchPoint} icon={searchIcon}>
                  <Popup>Point de recherche</Popup>
                </Marker>
                {searchMode === "radius" && (
                  <Circle
                    center={searchPoint}
                    radius={radiusM}
                    pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.1 }}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;