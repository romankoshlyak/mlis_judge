import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainPage from './components/MainPage';
import ProblemPage from './components/ProblemPage';
import SubmissionPage from './components/SubmissionPage';
import AdminPage from './components/AdminPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermOfService from './components/TermOfService';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route } from "react-router-dom";

ReactDOM.render(
  <Router>
    <div>
      <Route path='/' exact component={MainPage} />
      <Route path='/admin' component={AdminPage} />
      <Route path='/problem/:id' component={ProblemPage} />
      <Route path='/submission/:id' component={SubmissionPage} />
      <Route path='/privacy_policy' component={PrivacyPolicy} />
      <Route path='/term_of_service' component={TermOfService} />
    </div>
  </Router>,
   document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
