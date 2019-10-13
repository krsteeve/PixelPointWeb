import React, { Component } from 'react';
import ReactDOM from "react-dom";
import raf from 'raf';
import * as renderer from './Renderer'
import * as pixelization from './Pixelization'
import junimo from './strawberries-1330459_1920.jpg'
import pixTexture from './strawberries-1330459_1920.jpg'
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
 
export default class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pixels: null,
      mouseIsDown: false,
      imageOffset: {x: 0, y: 0},
      mouseDownPosition: {x: 0, y: 0},
      mouseDownOffset: {x: 0, y: 0},
      crop: {
        unit: "%",
        width: 30,
        aspect: 28/22
      },
      src: null
    }
  }
 
  componentDidMount() {
    // const canvas = document.querySelector('#glcanvas');
    // const gl = canvas.getContext('webgl');

    //   // If we don't have a GL context, give up now
    //   if (!gl) {
    //     alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    //     return;
    //   }

    //   this.rafHandle = raf(this.renderGlScene.bind(this, gl));
    //   this.programInfo = renderer.getTextureShaderProgram(gl);
    //   this.buffers = renderer.initBuffers(gl);

    //   this.setupPixels(0, 0);

    //   this.texture = renderer.loadTexture(gl, pixTexture);
    //   this.junimo = renderer.loadTexture(gl, junimo);
    
    //   gl.enable(gl.BLEND);
    //   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  setupPixels(xOffset, yOffset) {
    this.setState({pixels: null});
    const image = new Image();
    image.onload = () => {
      var pixResult = pixelization.pixelixeImage(image, 28, 22, xOffset, yOffset);
      this.setState({pixels: pixResult});
      this.imageAspect = image.width / image.height;
      console.log(pixResult.widthPercentage, pixResult.heightPercentage);
    };
    image.src = junimo;
  }

  renderGlScene(gl, programs) {
    renderer.drawStart(gl);

    if (this.state.mouseIsDown) {
      var width = 1;
      var height = 1;
      if (this.state.pixels != null) {
        width = 1 / this.state.pixels.widthPercentage;
        height = 1 / this.state.pixels.heightPercentage;
      }
      renderer.drawScene(gl, this.programInfo, this.buffers, this.junimo, this.state.imageOffset, {width:width, height:height}, {r: 0, g:0, b:0, a:255}, {r: 255, g:255, b:255, a:255});
    } else {
      if (this.state.pixels != null) {
        this.state.pixels.pixels.forEach((value, index) => {
          renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, {x:value.x * 1/28, y:value.y * 1/22}, {width:1/28, height:1/22}, value.color, value.color);
        }, this);
      }
    }

   

    this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

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
    const canvas = (
      <canvas id="glcanvas" 
        width="1280" 
        height="960" 
        style={{}}
      />
    );

    const { crop, src } = this.state;
      return (
        <div>
          <div>
        <input type="file" onChange={this.onSelectFile} />
      </div>
        {src && (<ReactCrop
          src={src}
          crop = {crop}
          onChange={this.onCropChange}
          style={{width:'50%'}}
        />)}
        </div>
      );
  }
}