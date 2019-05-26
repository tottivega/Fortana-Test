import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import styles from '../styles/Map.module.css'
import loading from '../img/loading.gif'
import noImage from '../img/noImage.png'

const MAPURL="https://api.brigada.mx/api/organizations/"
//These variables will only be calculated once throughout the code, and they will be set before anything renders thus state shouldn't be used for them.
let allSubmissions = [];
let actions = [];
let org = '';
let mapCenterLat = 0;
let mapCenterLng = 0;

class Map extends Component {
  constructor(props) {
   super(props);
   this.state = {
     loading:true,
     noData:false,
     errorMessage:'',
     org:'',
     submissions:[],
     highlightedSubmissions:[]
   };
 }

  componentDidMount(){
    fetch(MAPURL + this.props.match.params.id + '/')
    .then(response => response.json() )
    .then(data => {
          if (data.action_count > 0){

            data.actions.forEach((action)=>{
              if (action.submissions.length > 0){ //Making sure not to add an action without submissions to our dataset
                allSubmissions.push(...action.submissions.filter(sub=>sub.location)); //Making sure not to add submissions without location
              }
            });
            actions = data.actions;
            org = data.name
            this.setMidPoint() //we calculate the starting point of our map

            this.setState({loading:false, submissions:allSubmissions}); //after all that, we render our view.
          } else if (data.detail) {
            this.setState({loading:false, noData:true, errorMessage:'Sorry this org doesn\'t exist'});
          } else {
            this.setState({loading:false, noData:true, errorMessage:'Sorry there are no actions recorded for the org: ' + data.name});
          }

    })
    .catch(error => alert(error) );
  }

  setMidPoint(){
    const latitudes = allSubmissions.map(sub=>sub.location.lat)
    const longitudes = allSubmissions.map(sub=>sub.location.lng)
    mapCenterLat = ( Math.max(...latitudes) + Math.min(...latitudes) )/ 2
    mapCenterLng = ( Math.max(...longitudes) + Math.min(...longitudes) )/ 2
  }

  handleHover(id){
    const highlighted=[];
    const notHighligthed=[];
    actions.forEach((action)=>{
      if (action.id===id){
        highlighted.push(...action.submissions);
      } else {
        notHighligthed.push(...action.submissions);
      }
    });
    this.setState({submissions:notHighligthed, highlightedSubmissions:highlighted});
  }

  render(){
    if (this.state.loading){
      return <img src={loading} className={styles.centeredImage} alt={'loading'} />
    }
    if (this.state.noData){
      return <ErrorComponent errorMessage={this.state.errorMessage}/>
    }
    return(
      <div className={styles.wrapper}>
        <div className={styles.actionList}>
          {actions.map(action=>{
            return(
              <ActionComponent key={action.id}
                  action={action}
                  handleHover={this.handleHover.bind(this)}
                  handleMouseLeave={()=> this.setState({ submissions:allSubmissions,highlightedSubmissions:[] })}
              />
            )
          })}

        </div>
        <div className={styles.mapWrapper}>
          <h3>Organization: {org}</h3>
          <MyMapComponent data={this.state.submissions} highlightedData={this.state.highlightedSubmissions}
              googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyDDlWWLzL9FSvzc9Pk_V1WIZTup7Zp8No8&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `700px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              />

        </div>
      </div>
    );
  }
}

const MyMapComponent = withScriptjs(withGoogleMap((props) => {
  return(
  <GoogleMap
    defaultZoom={7}
    defaultCenter={{ lat: mapCenterLat,lng: mapCenterLng}}
  >
  {props.highlightedData.map((sub)=>{
    return(
      <Marker
      key={sub.id}
      position={{ lat: sub.location.lat, lng: sub.location.lng }}
      animation={1}
      />
    );
  })}
  {props.data.map((sub)=>{
    return(
      <Marker
      key={sub.id}
      position={{ lat: sub.location.lat, lng: sub.location.lng }}
      />
    );
  })}
  </GoogleMap>)}
));

const ActionComponent = (props)=>{
  //Even if the first submission doesn't have image, we will find one that does.
  const submissionsWithImages=props.action.submissions.filter(sub=>sub.images.length > 0)
  let imageSrc = noImage;
  let extraImages = 0;
  if (submissionsWithImages.length > 0 && submissionsWithImages[0].images.length > 0){
    //We set not found as defaults, then we only go through the logic if there are images.
    imageSrc = submissionsWithImages[0].images[0].url;
    extraImages = submissionsWithImages.map(sub=> sub.images.length).reduce((a,b) => a + b, 0) - 1;
  }
  return(
    <div className={styles.imageContainer}
         onMouseEnter={()=> props.handleHover(props.action.id) }
         onMouseLeave={()=> props.handleMouseLeave() }
    >
      <img src={imageSrc} style={{width:'80%'}} alt={''} />
      {extraImages && <div className={styles.imageInfo}>+{extraImages}</div>}
    </div>
  );
}

const ErrorComponent = (props)=> {
  return (
    <div className={styles.errorParent}>
      <div className={styles.errorChild}>
        <h1>{props.errorMessage}</h1>
      </div>
    </div>
  )
}


export default Map;
