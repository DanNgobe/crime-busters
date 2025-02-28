import { Badge, Grid, Typography } from 'antd';
import 'leaflet/dist/leaflet.css';
import React, { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useGetQuery } from '../hooks';
import useGeolocation from '../hooks/useGeolocation';
import { Incident } from '../types';
import createIncidentIcon from '../utils/createIncidentIcon';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const urgencyColors: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

const IncidentMap: React.FC = () => {
  const [visibleMarkers, setVisibleMarkers] = useState(true);
  const { data: incidents } = useGetQuery<Incident[]>({
    resource: 'incidents',
    queryKey: 'incidents',
  });

  const userLocation = useGeolocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!userLocation) {
    return <Text>Loading your location...</Text>; // Handle loading state
  }

  return (
    <div
      style={{
        height: isMobile ? '60vh' : '80vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
      }}
    >
      {userLocation ? (
        <MapContainer
          center={userLocation}
          zoom={10}
          style={{ height: '100%', width: '100%', borderRadius: '20px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Zoom control logic placed inside the MapContainer */}
          <MapZoomControl setVisibleMarkers={setVisibleMarkers} />

          {visibleMarkers &&
            incidents?.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createIncidentIcon(incident.type, urgencyColors[incident.urgency])}
              >
                <Popup>
                  <Badge
                    color={urgencyColors[incident.urgency]}
                    text={`Urgency: ${incident.urgency.toUpperCase()}`}
                  />
                  <Title level={5} style={{ marginTop: '8px' }}>
                    {incident.title}
                  </Title>
                  <Text>{incident.description}</Text>
                  <Text style={{ display: 'block', marginTop: '8px' }}>
                    <strong>Status:</strong> {incident.status}
                  </Text>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: '16px' }}>Loading map...</Text>
      )}
    </div>
  );
};

const MapZoomControl: React.FC<{
  setVisibleMarkers: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setVisibleMarkers }) => {
  useMapEvents({
    zoomend() {
      //@ts-ignore
      const zoomLevel = this.getZoom();
      setVisibleMarkers(zoomLevel > 8);
    },
  });
  return null;
};

export default IncidentMap;
