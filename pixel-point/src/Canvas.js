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
      width: 1280,
      height: 960
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.src != this.props.src) {
      this.setupPixels(this.props.src);
    }

    if (prevProps.crop != this.props.crop) {
      console.log("Crop updated!");
      const targetWidth = this.cropWidth() > this.cropHeight() ? 28 : 22;
      const targetHeight = this.cropWidth() > this.cropHeight() ? 22 : 28;
      var pixResult = pixelization.pixelixeImage(this.image, targetWidth, targetHeight, this.cropX(), this.cropY(), this.cropWidth(this.image), this.cropHeight(this.image));
      this.setState({ pixels: pixResult });
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

    this.setupPixels(this.props.src);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  setupPixels(src) {
    this.setState({ pixels: null });
    this.image = new Image();
    this.image.onload = () => {
      const targetWidth = this.cropWidth() > this.cropHeight() ? 28 : 22;
      const targetHeight = this.cropWidth() > this.cropHeight() ? 22 : 28;
      var pixResult = pixelization.pixelixeImage(this.image, targetWidth, targetHeight, this.cropX(), this.cropY(), this.cropWidth(), this.cropHeight());
      this.setState({ pixels: pixResult });

      const canvas = this.refs.canvas;
      let context = canvas.getContext('webgl');
      // store width, height and ratio in context for paint functions
      context.width = this.image.width;
      context.height = this.image.height;
      this.setState({ width: this.image.width, height: this.image.height })
      context.viewport(0, 0, canvas.width, canvas.height);


      this.texture = renderer.loadTexture(context, this.props.src);
    };
    this.image.src = src;
  }

  cropFactor() {
    const canvas = this.refs.canvas;
    return canvas.width / canvas.clientWidth;
  }

  cropWidth() {
    return this.props.crop.width ? Math.floor(this.props.crop.width * this.cropFactor()) : this.image.width;
  }

  cropHeight() {
    return this.props.crop.height ? Math.floor(this.props.crop.height * this.cropFactor()) : this.image.height;
  }

  cropX() {
    return this.props.crop.x ? Math.floor(this.props.crop.x * this.cropFactor()) : 0;
  }

  cropY() {
    return this.props.crop.y ? Math.floor(this.props.crop.y * this.cropFactor()) : 0;
  }

  renderGlScene(gl, programs) {
    renderer.drawStart(gl);

    renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, { x: 0, y: 0 }, { width: 1, height: 1 }, { r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 });

    if (this.state.pixels != null && this.props.crop.height) {
      const canvas = this.refs.canvas;
      const factor = gl.drawingBufferWidth / canvas.clientWidth;

      const offsetX = this.cropX() / gl.drawingBufferWidth;
      const offsetY = this.cropY() / gl.drawingBufferHeight;

      const targetWidth = this.cropWidth() > this.cropHeight() ? 28 : 22;
      const targetHeight = this.cropWidth() > this.cropHeight() ? 22 : 28;
      const pixWidth = (this.cropWidth() / gl.drawingBufferWidth) / targetWidth;
      const pixHeight = (this.cropHeight() / gl.drawingBufferHeight) / targetHeight;

      this.state.pixels.pixels.forEach((value, index) => {
        renderer.drawScene(gl, this.programInfo, this.buffers, this.texture, { x: value.x * pixWidth + offsetX, y: value.y * pixHeight + offsetY }, { width: pixWidth, height: pixHeight }, value.color, value.color);
      }, this);
    } else {

    }

    this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }

  render() {

    return (
      <canvas id="glcanvas"
        ref='canvas'
        width={this.state.width}
        height={this.state.height}
        style={{
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'block'
        }}
      />
    );
  }
}