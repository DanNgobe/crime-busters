import { AlertOutlined, CarOutlined, FireOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { useState } from 'react';

const filterOptions = [
  { key: 'fire', label: 'Fire', icon: <FireOutlined />, color: 'red' },
  { key: 'accident', label: 'Accident', icon: <CarOutlined />, color: 'orange' },
  { key: 'crime', label: 'Crime', icon: <AlertOutlined />, color: 'blue' },
];

const Filters: React.FC<{ onFilterChange: (filters: string[]) => void }> = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (key: string) => {
    const updatedFilters = selectedFilters.includes(key)
      ? selectedFilters.filter((f) => f !== key)
      : [...selectedFilters, key];

    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <Flex gap="small" wrap="wrap" justify="center" style={{ marginBottom: 16 }}>
      {filterOptions.map(({ key, label, icon, color }) => (
        <Button
          key={key}
          type={selectedFilters.includes(key) ? 'primary' : 'default'}
          icon={icon}
          shape="round"
          size="large"
          style={{
            borderColor: selectedFilters.includes(key) ? color : '#d9d9d9',
            color: selectedFilters.includes(key) ? '#fff' : color,
            backgroundColor: selectedFilters.includes(key) ? color : '#fff',
            transition: 'all 0.3s',
          }}
          onClick={() => toggleFilter(key)}
        >
          {label}
        </Button>
      ))}
    </Flex>
  );
};

export default Filters;
