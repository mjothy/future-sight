import React, { useState } from 'react';
import { Button, Input, Divider } from 'antd';
import { Link } from 'react-router-dom';

const HomeView: React.FC = () => {
  const [draftFromURL, setDraftFromURL] = useState('');

  return (
    <>
      <h2>Welcome to FutureSight!</h2>
      <Button type="primary">
        <Link to="draft">Create a new Dashboard</Link>
      </Button>
      <Input.Group style={{ display: 'flex', flexDirection: 'row' }}>
        <Button type="primary" disabled={!draftFromURL}>
          Start from another Dashboard
        </Button>
        <Input
          placeholder="https://..."
          value={draftFromURL}
          onChange={(e) => setDraftFromURL(e.target.value)}
        />
      </Input.Group>
      <Divider />
      <h3>Latest submissions</h3>
    </>
  );
};

export default HomeView;
