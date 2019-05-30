import React, { Component } from 'react';
import raf from 'raf';
import * as renderer from './Renderer'
import * as pixelization from './Pixelization'
import junimo from './P9174365.JPG'

 
export default class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pixels: null,
    }
  }
 
  componentDidMount() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

      // If we don't have a GL context, give up now
      if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
      }

      this.rafHandle = raf(this.renderGlScene.bind(this, gl));
      this.programInfo = renderer.getTextureShaderProgram(gl);
      this.buffers = renderer.initBuffers(gl);

      const image = new Image();
      image.onload = () => {
        this.setState({pixels: pixelization.pixelixeImage(image, 28, 22)});
      };
      image.src = junimo;

      this.texture = renderer.loadTexture(gl, junimo);
    
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  renderGlScene(gl, programs) {
    renderer.drawStart(gl);
    //renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, {x:0, y:0}, {width:640, height:480});

    if (this.state.pixels != null) {
      this.state.pixels.forEach((value, index) => {
        renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, {x:value.x, y:value.y}, {width:1/28, height:1/22}, value.color);
      }, this);
    }

    this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }
 
    render() {
        return (
          <canvas id="glcanvas" width="640" height="480"></canvas>
        );
    }
}