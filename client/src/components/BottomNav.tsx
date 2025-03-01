import {
  BellOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Flex, Grid } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;
const BottomNav: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!isMobile) return null;
  const navigate = useNavigate();

  return (
    <div style={navContainerStyle}>
      <Flex justify="space-around" align="center" style={navStyle}>
        {/* Home Button */}
        <Button type="text" icon={<HomeOutlined style={iconStyle} />} />

        {/* Alerts */}
        <Button type="text" icon={<BellOutlined style={iconStyle} />} />

        {/* Large Center Button */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          style={centerButtonStyle}
          onClick={() => navigate('/quick-report')}
        />

        {/* Map */}
        <Button type="text" icon={<EnvironmentOutlined style={iconStyle} />} />

        {/* Profile */}
        <Button type="text" icon={<UserOutlined style={iconStyle} />} />
      </Flex>
    </div>
  );
};

const navContainerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  background: '#fff',
  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  padding: '8px 0',
};

const navStyle: React.CSSProperties = {
  maxWidth: '500px',
  margin: '0 auto',
};

const iconStyle: React.CSSProperties = {
  fontSize: '24px',
  color: '#555',
};

const centerButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4f',
  borderColor: '#ff4d4f',
  boxShadow: '0 4px 8px rgba(255, 77, 79, 0.4)',
  transform: 'translateY(-12px)', // Makes it pop up
};

export default BottomNav;
