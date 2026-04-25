import { useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import { usePlanner } from '../../context/PlannerContext'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
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

// Manages a MarkerClusterGroup layer imperatively so it works with react-leaflet v4.
function ClusterLayer({ geocoded, itineraryIds, highlightedRowId, onHighlight, dispatch }) {
  const map = useMap()
  const clusterRef = useRef(null)

  useEffect(() => {
    const cluster = L.markerClusterGroup({ maxClusterRadius: 40, animate: true })
    clusterRef.current = cluster
    map.addLayer(cluster)
    return () => { map.removeLayer(cluster) }
  }, [map])

  useEffect(() => {
    const cluster = clusterRef.current
    if (!cluster) return
    cluster.clearLayers()

    geocoded.forEach(row => {
      const itinIndex = itineraryIds.indexOf(row.id)
      const inItinerary = itinIndex !== -1
      const label = inItinerary ? itinIndex + 1 : '·'
      const isHighlighted = highlightedRowId === row.id

      const marker = L.marker([row.lat, row.lng], {
        icon: makeNumberedIcon(label, inItinerary || isHighlighted),
      })

      const popupEl = document.createElement('div')
      popupEl.innerHTML = `
        <strong>${row.title}</strong><br/>
        ${row.city}<br/>
        <span style="color:#6b6b6b;font-size:12px">${row.time}</span>
      `
      const btn = document.createElement('button')
      btn.style.cssText = 'margin-top:6px;padding:3px 10px;background:' +
        (inItinerary ? '#c0392b' : '#2a6b4e') +
        ';color:#fff;border:none;border-radius:4px;cursor:pointer'
      btn.textContent = inItinerary ? 'Remove' : '+ Add to itinerary'
      btn.addEventListener('click', () => {
        dispatch({ type: inItinerary ? 'REMOVE_FROM_ITINERARY' : 'ADD_TO_ITINERARY', rowId: row.id })
      })
      popupEl.appendChild(btn)

      marker.bindPopup(popupEl)
      marker.on('click', () => onHighlight?.(row.id))
      cluster.addLayer(marker)
    })
  }) // intentionally no dep array — re-sync every render so icons stay current

  return null
}

export default function MapView({ rows, pendingCount, failedCount, onRetry, highlightedRowId, onHighlight }) {
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
        <ClusterLayer
          geocoded={geocoded}
          itineraryIds={itineraryIds}
          highlightedRowId={highlightedRowId}
          onHighlight={onHighlight}
          dispatch={dispatch}
        />
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
