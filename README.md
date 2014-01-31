petitóJPEG JS 
==========

### A high performance JPEG Encoder written in JavaScript ####

petitóJPEG is a high performance JPEG encoder written in JavaScript. It is not a port from C code and it's a direct write into JavaScript. 

The encoder makes pervasive use of TypedArrays so you'll need an interpreter that supports this.

### Usage ###
The encoder accepts images in RGBA format which happens to be the format that of the ImageData object used in canvas. 

1) Provide the byte writer object. This is where the compressed data will be written to. There is a default ByteWriter object you can use that writes the result into a memory buffer you can later retrieve.

```javascript
var encoder = new pttJPEG();

// use default byte writer
var bw = new encoder.ByteWriter();

// or roll your own
var myByteWriter = function() {
    // write get's called everytime there is data available from the encoder
    // array is a Uint8Array. The data to be written starts at the 'start' position
    // and there are 'count' bytes to write
    this.write = function( array, start, count ) {
        ...
    };
var bw = new myByteWriter();
```

2) Wrap the image to be encoded in a pttImage object
```javascript
//pttImage constructor accepts an ImageData object as return by the 
// getImageData() of the canvas context so you can just:

var inImage = new encoder.pttImage( myImageDataObject );
```
3) Fire up the encoder
```javascript
var quality = 50;

encoder.encode( quality, inImage, bw );
// this encodes the picture and keeps calling your bytewriter when there is data available. On exit
// all data has been written out to the bytewriter
```


