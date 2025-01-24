import { Button, Card, Form, Input, Select } from 'antd';
import React from 'react';
import { useCreateMutation } from '../hooks';
import useGeolocation from '../hooks/useGeolocation';
import { IncidentInput } from '../types';

const { Option } = Select;

const ReportIncident: React.FC = () => {
  const userLocation = useGeolocation();
  const { mutate: reportIncident, isPending } = useCreateMutation({
    resource: 'incidents',
    onSuccessMessage: 'Incident reported successfully',
    onSuccessCallback: () => handleSuccess(),
  });

  const [form] = Form.useForm(); // Create form instance

  const onFinish = (values: any) => {
    const { type, title, description, urgency } = values;

    const newIncident: IncidentInput = {
      type,
      title,
      description,
      urgency,
      latitude: userLocation?.[0] ?? 0,
      longitude: userLocation?.[1] ?? 0,
      status: 'pending',
      user_id: 'user-id-123',
    };

    reportIncident(newIncident);
  };

  const handleSuccess = () => {
    // Reset the form on successful report submission
    form.resetFields();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
      <Card style={{ width: 400 }}>
        <h3 style={{ textAlign: 'center' }}>Report an Incident</h3>
        <Form
          form={form} // Bind form instance to the Form component
          name="reportIncident"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ urgency: 'medium' }}
        >
          {/* Incident Type */}
          <Form.Item
            label="Incident Type"
            name="type"
            rules={[{ required: true, message: 'Please select the incident type' }]}
          >
            <Select placeholder="Select Incident Type">
              <Option value="Pothole">Pothole</Option>
              <Option value="Crime">Crime</Option>
              <Option value="Flooding">Flooding</Option>
              <Option value="Fire">Fire</Option>
              <Option value="Accident">Accident</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          {/* Title */}
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input a title' }]}
          >
            <Input placeholder="Enter a brief title for the incident" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please provide a description' }]}
          >
            <Input.TextArea placeholder="Describe the incident in detail" rows={4} />
          </Form.Item>

          {/* Urgency */}
          <Form.Item
            label="Urgency"
            name="urgency"
            rules={[{ required: true, message: 'Please select urgency' }]}
          >
            <Select placeholder="Select Urgency">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isPending}>
              Report Incident
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReportIncident;
