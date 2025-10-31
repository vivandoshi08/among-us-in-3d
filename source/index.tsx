import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './resources/styling/main.css';
import Application from './application';

ReactDOM.render(
  <Suspense fallback={null}>
    <Application />
  </Suspense>,
  document.getElementById('root')
);
