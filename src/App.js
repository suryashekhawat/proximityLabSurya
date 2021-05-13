import React, {useEffect, useState} from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './App.css';
import Moment from 'react-moment';
import { Chart } from 'react-charts';

const client = new W3CWebSocket('ws://city-ws.herokuapp.com');

const cgraph = {};
function App() {
  const [data, set_data] = useState();
  const [air_data, set_air_data] = useState({});

  const [gdata, set_gdata] = useState([
    {
      label: '',
      data: []
    }
  ])

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'linear', position: 'bottom' },
      { type: 'linear', position: 'left' }
    ],
    []
  )

  function updateGData(city){
    console.log('clicked', city, cgraph);
    if (air_data[city]){
      set_gdata([
        {
          label: '',
          data: cgraph[city]
        }
      ])

    }
  }

  function updateData(){
    let temp = data;
    if (Array.isArray(temp)){
      for (let i in temp){
        console.log(temp[i]);

        temp[i]['last_updated'] = new Date();
        let aqi = temp[i].aqi;
        if (aqi >= 0 && aqi <=50){
          temp[i]['color'] = 'green';
        }else if (aqi >= 51 && aqi <=100){
          temp[i]['color'] = 'lightgreen';
        }else if (aqi >= 101 && aqi <=200){
          temp[i]['color'] = 'yellow';
        }else if (aqi >= 201 && aqi <=300){
          temp[i]['color'] = 'orange';
        }else{
          temp[i]['color'] = 'red';
        }

        air_data[temp[i].city] = temp[i];


        set_air_data(air_data)
      }
    }
  }

  useEffect(()=>{
    client.onopen = () => {
      console.log('Connected');
    };

    client.onmessage = (message) => {
      let d = JSON.parse(message.data);
      let new_data = d.map(c=>{
        console.log("cgraph", cgraph);
        if (cgraph[c.city]){
          cgraph[c.city].push([(cgraph[c.city].length-1)+1, c.aqi])
        }else {
          if (!cgraph[c.city]){
            cgraph[c.city] = []
          }
        }




        return {
          city: c.city,
          aqi: c.aqi,
        }
      })
      set_data(new_data);
    };

    updateData();
  })

  return (
    <div className="App">
      <h1>Live AQI | Proxmity [by Surya]</h1>
      <table>
        <thead>
          <tr>
            <th>City</th>
            <th>Current AQI</th>
            <th>Last Updated</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {air_data && Object.keys(air_data).map((d, i)=><tr key={i}>
              <td>{air_data[d].city}</td>
              <td style={{color: air_data[d].color}}>{air_data[d].aqi.toFixed(2)}</td>
              <td><Moment fromNow ago>{air_data[d].last_updated}</Moment></td>
              <td>
                <button onClick={()=>updateGData(air_data[d].city)}>View Graph</button>
              </td>
            </tr>)}
        </tbody>
      </table>
      <div  style={{
        background: 'white',
        width: '100%',
        height: '300px'
      }}>
        <Chart data={gdata} axes={axes} />
      </div>
    </div>
  );
}

export default App;
