import L from 'leaflet';

const incidentIcons: Record<string, string> = {
  Pothole: '/icons/pothole.png',
  Crime: '/icons/crime.png',
  Flooding: '/icons/flooding.png',
  Fire: '/icons/fire.png',
  Accident: '/icons/accident.png',
  Other: '/icons/other.png',
};

// Utility to create color-coded icons with urgency background
const createIncidentIcon = (incidentType: string, urgencyColor: string) =>
  L.divIcon({
    html: `
        <div style="position: relative; display: flex; justify-content: center; align-items: center;">
  <div style="
    background-color: ${urgencyColor};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: absolute;
    animation: ringAnimation 2s infinite ease-in-out; /* Animation applied here */
  "></div>
  <img src="${incidentIcons[incidentType] || incidentIcons.Other}" 
    alt="${incidentType}" 
    style="width: 25px; height: 25px; z-index: 1;" />
</div>
      `,
    className: '', // Prevent default Leaflet styles
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

export default createIncidentIcon;
