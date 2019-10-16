import React from 'react';
import logo from './logo.svg';
import './App.css';

import Canvas from './Canvas';

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

class  App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      crop: {
        unit: "px",
        aspect: 28/22,
      },
      completeCrop: {},
      src: null
    }
  }

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

  onCompleteCrop = (crop, percentCrop) => {
    this.setState({completeCrop: crop});
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        this.setState({ src: reader.result })
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  render() {
    const { crop, src } = this.state;

    const canvas = (<Canvas src={src} crop={this.state.completeCrop}/>);

    return (
      <div className="App" style={{}}>
        <header className="App-header">
          <div>
            <input type="file" onChange={this.onSelectFile} />
          </div>
          {src && (<ReactCrop
            src={src}
            crop = {crop}
            onChange={this.onCropChange}
            onComplete={this.onCompleteCrop}
            style={{}}
            renderComponent={canvas}
          />)}
        </header>
      </div>
    );
  }
}

export default App;
