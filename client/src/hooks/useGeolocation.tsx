import { message } from 'antd';
import { useEffect, useState } from 'react';

const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          message.error('Unable to fetch your location. Defaulting to South Africa.');
          setUserLocation([-30.5595, 22.9375]); // Default to South Africa
        },
      );
    } else {
      message.error('Geolocation is not supported by your browser.');
      setUserLocation([-30.5595, 22.9375]); // Default to South Africa
    }
  }, []);

  return userLocation;
};

export default useGeolocation;
