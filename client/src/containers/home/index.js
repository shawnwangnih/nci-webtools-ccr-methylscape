import React from 'react'
import ResultsTable from './components/resultsTable'

import { connect } from 'react-redux'

const Home = props => (
  <div>
    <ResultsTable/>
  </div>
)

export default connect(
)(Home)
