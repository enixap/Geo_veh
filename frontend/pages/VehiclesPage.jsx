import React, { useEffect, useState } from "react";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from "../services/api";

const EMPTY_FORM = { name: "", plate_number: "" };

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const load = async () => {
    try {
      setError("");
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.plate_number.trim()) {
      setError("Nom et immatriculation requis.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateVehicle(editingId, form);
        setVehicles((prev) => prev.map((v) => v.id === editingId ? updated : v));
      } else {
        const created = await createVehicle(form);
        setVehicles((prev) => [...prev, created]);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setForm({ name: v.name, plate_number: v.plate_number });
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur suppression.");
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#e5e7eb" }}>
         Gestion des véhicules
      </h2>

      {/* Formulaire */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "#e5e7eb" }}>
          {editingId ? "Modifier le véhicule" : "➕ Nouveau véhicule"}
        </h3>
        <div className="field">
          <label htmlFor="name">Nom du véhicule</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Camion 01"
          />
        </div>
        <div className="field">
          <label htmlFor="plate">Immatriculation</label>
          <input
            id="plate"
            type="text"
            value={form.plate_number}
            onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value }))}
            placeholder="Ex: AB-123-CD"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            className="btn"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
          </button>
          {editingId && (
            <button className="btn btn-outline" onClick={handleCancel}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="card">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "#e5e7eb" }}>
          📋 Véhicules enregistrés{" "}
          <span className="badge" style={{ marginLeft: "0.4rem" }}>{vehicles.length}</span>
        </h3>

        {loading && <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Chargement...</p>}

        {!loading && vehicles.length === 0 && (
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Aucun véhicule. Créez-en un ci-dessus.
          </p>
        )}

        {vehicles.map((v) => (
          <div
            key={v.id}
            className="vehicle-item"
            style={{ cursor: "default", marginBottom: "0.4rem" }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{v.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{v.plate_number}</div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className="btn btn-outline"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                onClick={() => handleEdit(v)}
              >
                 Modifier
              </button>
              {confirmDeleteId === v.id ? (
                <>
                  <button
                    className="btn"
                    style={{
                      fontSize: "0.75rem", padding: "0.25rem 0.6rem",
                      background: "#ef4444", borderColor: "#ef4444"
                    }}
                    onClick={() => handleDelete(v.id)}
                  >
                    Confirmer
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline"
                  style={{
                    fontSize: "0.75rem", padding: "0.25rem 0.6rem",
                    borderColor: "#ef4444", color: "#ef4444"
                  }}
                  onClick={() => setConfirmDeleteId(v.id)}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VehiclesPage;