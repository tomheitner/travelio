import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { usePlanner } from '../../context/PlannerContext'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapView.module.css'

// Fix leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeNumberedIcon(n, highlighted) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${highlighted ? '#e07b39' : '#2a6b4e'};
      color:#fff;font-size:12px;font-weight:700;
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);
    ">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function FitBounds({ positions }) {
  const map = useMap()
  useMemo(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [positions.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function MapView({ rows, pendingCount, failedCount, onRetry }) {
  const { state, dispatch } = usePlanner()

  // Only rows that have been geocoded
  const geocoded = rows.filter(r => r.lat !== null && r.lng !== null)

  // Itinerary order: rows sorted by itinerary position
  const itineraryIds = state.itinerary.map(i => i.rowId)
  const ordered = itineraryIds
    .map(id => geocoded.find(r => r.id === id))
    .filter(Boolean)

  const polylinePoints = ordered.map(r => [r.lat, r.lng])

  const positions = geocoded.map(r => [r.lat, r.lng])

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={[45.4, 12.3]}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 0 && <FitBounds positions={positions} />}
        {polylinePoints.length > 1 && (
          <Polyline positions={polylinePoints} color="#e07b39" weight={2} dashArray="6 4" />
        )}
        {geocoded.map(row => {
          const itinIndex = itineraryIds.indexOf(row.id)
          const inItinerary = itinIndex !== -1
          const label = inItinerary ? itinIndex + 1 : '·'
          return (
            <Marker
              key={row.id}
              position={[row.lat, row.lng]}
              icon={makeNumberedIcon(label, inItinerary)}
            >
              <Popup>
                <strong>{row.title}</strong><br />
                {row.city}<br />
                <span style={{ color: '#6b6b6b', fontSize: 12 }}>{row.time}</span><br />
                {!inItinerary ? (
                  <button
                    style={{ marginTop: 6, padding: '3px 10px', background: '#2a6b4e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => dispatch({ type: 'ADD_TO_ITINERARY', rowId: row.id })}
                  >
                    + Add to itinerary
                  </button>
                ) : (
                  <button
                    style={{ marginTop: 6, padding: '3px 10px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => dispatch({ type: 'REMOVE_FROM_ITINERARY', rowId: row.id })}
                  >
                    Remove
                  </button>
                )}
              </Popup>
            </Marker>
          )
        })}
        {rows.filter(r => r.lat === null).map(row => (
          <span key={row.id} />
        ))}
      </MapContainer>
      {pendingCount > 0 && (
        <div className={styles.geocodingBanner}>
          Locating {pendingCount} destination{pendingCount !== 1 ? 's' : ''} on map…
        </div>
      )}
      {pendingCount === 0 && failedCount > 0 && (
        <div className={styles.failedBanner}>
          {failedCount} location{failedCount !== 1 ? 's' : ''} could not be found.
          {onRetry && (
            <button className={styles.retryBtn} onClick={onRetry}>Retry</button>
          )}
        </div>
      )}
    </div>
  )
}
