import React, { Component } from 'react';
import ReactDOM from "react-dom";
import raf from 'raf';
import * as renderer from './Renderer'
import * as pixelization from './Pixelization'
import memoize from "memoize-one";
 
export default class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pixels: null,
      width:1280,
      height:960
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

      // this.setupPixels(this.props.src);
    
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  setupPixels(src) {
    this.setState({pixels: null});
    const image = new Image();
    image.onload = () => {
      var pixResult = pixelization.pixelixeImage(image, 28, 22, 0, 0);
      //this.setState({pixels: pixResult});
      this.imageAspect = image.width / image.height;
      console.log(pixResult.widthPercentage, pixResult.heightPercentage);

      const canvas = this.refs.canvas;
			let context = canvas.getContext('webgl');
			// store width, height and ratio in context for paint functions
			context.width = image.width;
      context.height = image.height;
      this.setState({width:image.width, height:image.height})
      context.viewport(0, 0, canvas.width, canvas.height);

      
      this.texture = renderer.loadTexture(context, this.props.src);
    };
    image.src = src;
  }

  memoizeSrc = memoize(
    (src) => this.setupPixels(src)
  );

  renderGlScene(gl, programs) {
    renderer.drawStart(gl);

    if (this.state.pixels != null) {
      this.state.pixels.pixels.forEach((value, index) => {
        renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, {x:value.x * 1/28, y:value.y * 1/22}, {width:1/28, height:1/22}, value.color, value.color);
      }, this);
    } else {
      renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, {x:0, y:0}, {width:1, height:1}, {r: 0, g:0, b:0, a:255}, {r: 255, g:255, b:255, a:255});
    }

    this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }

  render() {

      this.memoizeSrc(this.props.src);
      
      return (
        <canvas id="glcanvas" 
        ref ='canvas'
        width={this.state.width}
        height={this.state.height} 
        style={{
          maxWidth: '100%',
          display: 'block'
				}}
      />
      );
  }
}