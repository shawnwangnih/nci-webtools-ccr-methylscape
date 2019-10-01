import React from 'react';
class Help extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{ padding: '30px' }}>
        <h3>About Methylscape</h3>
        <p>
          Methylscape allows users to see basic information on different
          experiments/projects so that the user can easily find the information
          they are looking for.
        </p>
        <h3>Projects Page</h3>
        <p>
          Select the different projects to see more information on them. You can
          use the filter on the top to search for different projects and
          investigators.
        </p>
      </div>
    );
  }
}
export default Help;
