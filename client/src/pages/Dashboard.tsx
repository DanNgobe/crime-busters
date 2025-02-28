import { Card, Col, Layout, Row, Typography } from "antd";
import React from "react";
import BottomNav from "../components/BottomNav";
import Filters from "../components/FilterButtons";
import IncidentCard from "../components/IncidentCard";
import IncidentMap from "../components/IncidentMap";
import { useGetQuery } from "../hooks";
import { Incident } from "../types";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { data: incidents } = useGetQuery<Incident[]>({
    resource: "incidents",
    queryKey: "incidents",
  });

  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  const filteredIncidents = incidents?.filter(
    (incident) =>
      selectedFilters.length === 0 || selectedFilters.includes(incident.type)
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/logo256.png"
            alt="Sound Busters"
            style={{ height: 32, marginLeft: 8 }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Sound Busters
          </Title>
        </div>
      </Header>

      <Content style={{ margin: "16px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <IncidentMap />
          </Col>
          <Col xs={24} lg={8}>
            <Filters
              onFilterChange={(filters) =>
                setSelectedFilters(filters as string[])
              }
            />
            <Card
              title="Recent Incidents"
              style={{ height: "80vh", overflow: "auto" }}
            >
              {filteredIncidents?.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  title={incident.title}
                  description={incident.description}
                  status={incident.status}
                  type={incident.type}
                />
              ))}
            </Card>
          </Col>
        </Row>
      </Content>
      <BottomNav />
    </Layout>
  );
};

export default Dashboard;
