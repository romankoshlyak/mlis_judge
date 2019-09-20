import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainPage from './components/MainPage';
import ProblemPage from './components/ProblemPage';
import SubmissionPage from './components/SubmissionPage';
import AdminPage from './components/AdminPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermOfService from './components/TermOfService';
import UserPage from './components/UserPage';
import RankingPage from './components/RankingPage';
import Mentors from './components/UserPage';
import ClassesPage from './components/ClassesPage';
import ClassPage from './components/ClassPage';
import ProblemRankingPage from './components/ProblemRankingPage';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route } from "react-router-dom";

ReactDOM.render(
  <Router>
    <div>
      <Route path='/' exact component={MainPage} />
      <Route path='/admin' component={AdminPage} />
      <Route path='/user/:id' component={UserPage} />
      <Route path='/ranking' component={RankingPage} />
      <Route path='/mentors' component={Mentors} />
      <Route path='/classes' component={ClassesPage} />
      <Route path='/class/:id' component={ClassPage} />
      <Route path='/problem_ranking/:id' component={ProblemRankingPage} />
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
