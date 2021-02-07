import React, { useEffect, useState } from 'react';
import { setInterval, clearInterval } from 'requestanimationframe-timer';

import { db } from '../../firebase';

function formatTimer(timer) {
  return ((timer.toString()).substring(0, timer.toString().length - 3) || '0') + '.' + (timer < 100 && timer > 1 ? '0' : '') + ((timer.toString()).substring(timer.toString().length - 3, timer.toString().length - 1) || '00');
}

function Spectator({room}) {

  const [alreadySolving, setAlreadySolving] = useState(false);

  const [runner1, setRunner1] = useState({});
  const [runner2, setRunner2] = useState({});

  const [timer1, setTimer1] = useState(0);
  const [timer2, setTimer2] = useState(0);


  useEffect(() => {
    // There isn't really any way to check the time while solving if not updating the db at least every second.
    // + No real need to check if both runners already started (ignoring the delay between runners, which is a positive thing anyway).
    db.collection('timer-rooms').doc(room).collection('runners').doc('runner1').get('state').then(s => setAlreadySolving(s.data().state === 'solving' ? true : false));
  }, [room, setAlreadySolving])

  useEffect(() => {
    let info = db.collection('timer-rooms').doc(room).collection('runners').doc('runner1').onSnapshot(s => setRunner1(s.data()));
    return () => info();
  }, [room, setRunner1]);

  useEffect(() => {
    let info = db.collection('timer-rooms').doc(room).collection('runners').doc('runner2').onSnapshot(s => setRunner2(s.data()));
    return () => info();
  }, [room, setRunner2]);


  useEffect(() => {
    if (runner1?.['state'] === 'solving') {
      setTimer1(0);
      const interval = setInterval(() => setTimer1(time => time + 10), 10);
      return () => clearInterval(interval);
    }
  }, [runner1, setTimer1]);

  useEffect(() => {
    if (runner2?.['state'] === 'solving') {
      setTimer2(0);
      const interval = setInterval(() => setTimer2(time => time + 10), 10);
      return () => clearInterval(interval);
    }
  }, [runner2, setTimer2]);


  return (
    <>
      <h1 style={{fontSize: '72px'}}>SPECTATOR MODE</h1>
      <div className="timer">
        <span className="spectator__runners">

          <span>
            <h2>
              {runner1?.['name'] !== '' ? runner1?.['name'] : 'RUNNER 1'}
            </h2>
            <h1>
              {runner1?.['current-time'] !== undefined &&
              (runner1?.['current-time'] === 0 ? (runner1?.['state'] === 'solving' ? (alreadySolving ? 'SOLVING' : formatTimer(timer1)) : runner1?.['state']) : formatTimer(runner1?.['current-time']))}
            </h1>
          </span>

          <span>
            <h2>
              {runner2['name'] !== '' ? runner2['name'] : 'RUNNER 2'}
            </h2>
            <h1>
              {runner2?.['current-time'] !== undefined &&
              (runner2?.['current-time'] === 0 ? (runner2?.['state'] === 'solving' ? (alreadySolving ? 'SOLVING' : formatTimer(timer2)) : runner2?.['state']) : formatTimer(runner2?.['current-time']))}
            </h1>
          </span>

        </span>
      </div>
    </>
  );
}

export default Spectator;