import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Helper to determine severity marker color
const getSeverityColor = (category) => {
  switch (category) {
    case "CRITICAL": 
    case "HIGH": return "#EF4444"; // red
    case "MODERATE": return "#F59E0B"; // yellow
    case "LOW": return "#10B981"; // green
    default: return "#6B7280"; // gray
  }
};

const getInitial = (category) => {
  switch (category) {
    case "CRITICAL": return "C";
    case "HIGH": return "H";
    case "MODERATE": return "M";
    case "LOW": return "L";
    default: return "?";
  }
};

// Custom Icon
const createCustomIcon = (category) => {
  const color = getSeverityColor(category);
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative">
        <svg viewBox="0 0 24 24" class="w-8 h-8" style="fill: ${color}; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3
           3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 
          -translate-y-1/2 text-white text-xs font-bold" style="margin-top:-4px;">
          ${getInitial(category)}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Default center (Nashik)
const NASHIK_CENTER = [19.9975, 73.7898];

const IncidentMap = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/incidents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIncidents(data);
      } catch (err) {
        console.error("Error fetching incidents:", err);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Incident Locations</h2>
      <div className="h-[400px] rounded-lg overflow-hidden">
        <MapContainer center={NASHIK_CENTER} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {incidents.map((incident) => (
            <Marker
              key={incident._id}
              position={[incident.location.coordinates[1], incident.location.coordinates[0]]} // [lat, lng]
              icon={createCustomIcon(incident.animalInfo.aiSeverityAssessment.category)}
            >
              <Popup>
                <div className="p-3">
                  <h3 className="font-semibold text-lg mb-1">{incident.description}</h3>
                  <p className="text-gray-600 mb-2">{incident.location.address}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      incident.animalInfo.aiSeverityAssessment.category === "HIGH" ||
                      incident.animalInfo.aiSeverityAssessment.category === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : incident.animalInfo.aiSeverityAssessment.category === "MODERATE"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {incident.animalInfo.aiSeverityAssessment.category} Priority
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">Critical / High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Low</span>
        </div>
      </div>
    </div>
  );
};

export default IncidentMap;
