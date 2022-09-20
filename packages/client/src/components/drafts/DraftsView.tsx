import React from 'react';
import './DraftsView.css';
import Preview from '../Preview';
import { getDrafts } from './DraftUtils';

export default class DraftsView extends React.Component<any, any> {
  objectMap = (obj, fn) => {
    const ret = Object.fromEntries(
      Object.entries(obj).map(([k, v], i) => [k, fn(k, v, i)])
    );
    return Object.values(ret);
  };

  render() {
    return (
      <div className="drafts-view-wrapper">
        <h2 style={{ marginTop: '0.5em' }}>Your drafts</h2>
        <div className="drafts-container">
          {Object.entries(getDrafts()).map(([key, value]) => {
            return (
              <div key={key} className="draft-preview">
                <Preview id={key} conf={value} urlPrefix={'/draft?id='} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
