import React from 'react';
import './DraftsView.css';
import Preview from '../Preview';
import { getDrafts } from './DraftUtils';

export default class DraftsView extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            drafts: {},
        };
    }

    componentDidMount() {
        this.refreshDrafts()
    }

    objectMap = (obj, fn) => {
    const ret = Object.fromEntries(
      Object.entries(obj).map(([k, v], i) => [k, fn(k, v, i)])
    );
    return Object.values(ret);
    };

    refreshDrafts = () => {
        this.setState({
            drafts: getDrafts()
        })
    }


  render() {
    return (
      <div className="drafts-view-wrapper">
        <h2 style={{ marginTop: '0.5em' }}>Your drafts</h2>
        <div className="drafts-container">
          {Object.entries(this.state.drafts).map(([key, value]) => {
            return (
              <div key={key} className="draft-preview">
                <Preview id={key} conf={value} urlPrefix={'/draft?id='} refreshDrafts={this.refreshDrafts} isDraft ={true}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
