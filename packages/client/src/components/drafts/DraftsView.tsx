import React from 'react';
import { Image } from 'antd';
import { Link } from 'react-router-dom';

const DraftsView: React.FC = () => {
  return (
    <>
      <h2>Your drafts</h2>
      <Image.PreviewGroup>
        {Object.keys(localStorage).map((key) => (
          <Link key={key} to={'/draft?id=' + key}>
            <Image
              width={200}
              height={200}
              src="https://webcolours.ca/wp-content/uploads/2020/10/webcolours-unknown.png"
            />
          </Link>
        ))}
      </Image.PreviewGroup>
    </>
  );
};

export default DraftsView;
