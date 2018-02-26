import React, { Component } from 'react';
import {Sensor,Data} from './model.js'  
import mqtt from 'mqtt';
import {BrowserRouter as Router,Route, Redirect, Link} from 'react-router-dom'
import './App.css';



var MQTTServer = 'mqtt://127.0.0.1:8080'
var clientmqtt = mqtt.connect(MQTTServer)


clientmqtt.on('connect', function () {
  clientmqtt.subscribe('#')
})
let SensorSList= [];

function ListCapteur(name, list) {

  var i;
  for (i = 0; i < list.length; i++) {
      if (list[i].name === name) {
          return true;
      }
  }
  return false;
}

function getSensorFromList(name, list){
  var i;
  for (i = 0; i < list.length; i++) {
      if (list[i].name === name) {
          return list[i];
      }
  }
}

class HistoriqueCapteur extends React.Component{
  render(){
      
      //on enregistre les six dernières valeurs
      if ( typeof this.props.capteur === 'undefined' ){
          // Dans le cas ou on arrive pas a avoir des valeur  ou on attend de les avoir 
          return (
              <div className="HistoriqueCapteur">
                  <p> Chargement ...</p>
              </div>
          );
      }
      
      let LastSixValue = this.props.capteur.data.values.slice(Math.max(this.props.capteur.data.values.length - 6, 1))
      const values = LastSixValue.map(function(value){
                  if (Number(value)){
                      return  <tr><td>{Number(value).toFixed(5)}</td></tr>
                  }else{
                      return  <tr><td>{value}</td></tr>
                  }
          
      });
      return (
          <table className="HistoriqueCapteur">{values}</table>
      );
  }
}


class ListSensorCapteur extends React.Component{
  render(){
      const values = this.props.list.map(function(value){
          return  <li>
                      <Link to={`/${value.name}`}>
                          <button> 
                              {value.name}
                          </button>
                      </Link>
                      
                  </li>
      });
      return (
          <ul id="list_capteur">{values}</ul>
      );
  }
}


class SensorComposanteCapteur extends React.Component
{
	
	
	render(){
		console.log(this.props.capteur);
		if ( typeof(this.props.capteur) === 'undefined' ){
			return (
				<div className="SensorcomposanteCapteur">
					<p> Chargement ...</p>
				</div>
			);
		}
		var valeur;
		if (Number(this.props.capteur.data.getlastValues())){
			valeur = parseFloat(this.props.capteur.data.getlastValues()).toFixed(4);
		}else{
			valeur = this.props.capteur.data.getlastValues();
		}	
			return (
			<div className="SensorComposanteCapteur">
					<h2><em>{this.props.capteur.name}</em><em>{" ["+this.props.capteur.type+"]"}</em></h2>
					<div>
						<div>
							<h3>valuer Actuelle: </h3>
							<p>{valeur}</p>
						</div>
					</div>
				</div>
			
		);
	}
}

class App extends Component {
  constructor(props) {
    super(props); 
    this.sensor = null;
    this.state = {value: '',list: []};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.GetData();
  }
  handleChange(event) {
    this.setState({value: "/"+event.target.value});
  }
  handleSubmit(event) {
    return <Redirect to="" />;    
  }
   GetData(){
    let this_composont = this;
    clientmqtt.on('message', function (topic, message) { 
      
      var Json_Data = JSON.parse(message.toString());
      
      var Sensor_Name = topic.substring(6); 
      
      var Val = Json_Data['value'];
        
      var TypeSensor = Json_Data['type'] 
      
      var InstanceSensor;
     
      if(!ListCapteur(Sensor_Name,SensorSList)){ 

          var _data = new Data([Val]);

          InstanceSensor= new Sensor(Sensor_Name,TypeSensor,_data);
      
          SensorSList.push(InstanceSensor);
    
      
        }
        else{
         
          InstanceSensor= getSensorFromList(Sensor_Name,SensorSList);
    
          Array.prototype.push.apply(InstanceSensor.data.values, [Val]);
          
          }
          this_composont.setState({list:SensorSList});
      });
  }
  getSensorFromTheStateList(name){
    var i;
    for (i = 0; i < this.state.list.length; i++) {
        if (this.state.list[i].name === name) {
            return this.state.list[i];
        }
    }
  }



  
  render() {
    return (
      <Router>
      <div id="container">        
          <header><center>
            <form onSubmit={this.handleSubmit} action={this.state.value}> 
                Broker :
                <input type="text" onChange={this.handleChange}/>
                <input type="submit" value="Submit" />
            </form> 
            </center>
          </header>
          <div className="wrapper">
            <nav>
                <ListSensorCapteur list={this.state.list}/>
            </nav>
            <article>
              <Route path="/:NomDucapteur" render={(props) => {return <SensorComposanteCapteur capteur={this.getSensorFromTheStateList(props.match.params.NomDucapteur)} />}} />
            </article>
            <aside>
              <h3>Historique</h3>
              <Route path="/:NomDucapteur" render={(props) => {return <HistoriqueCapteur capteur={this.getSensorFromTheStateList(props.match.params.NomDucapteur)} />}} />
            </aside>
          </div>
          <footer></footer>
        
       </div>
       </Router>
       
    );
  }
 
}

export default App;
