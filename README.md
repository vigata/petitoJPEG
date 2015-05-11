petitóJPEG
===============================

## A high performance JPEG Encoder written in JavaScript ##

petitóJPEG is a high performance JPEG encoder written in JavaScript. It can encode huge images (~64 Megapixels) in about 1000ms with contemporary CPUs. It is not a port from C code and it's a direct write into JS. The encoder makes pervasive use of TypedArrays so you'll need an interpreter that supports this. Currently supported contexts are:
- The web browser
- nodeJS
- As a WebWorker
- AMD/RequireJS

## Live demo ##
See petitóJPEG in action right from the browser here http://godromo.com/petitojpeg

## Performance ##
Contemporary javascript engines have gotten very good at dealing with data in typed arrays. petitóJPEG makes exhaustive use of these. In my testing I've seen encode times of ~1000ms of 64 megapixel images on my Haswell intel core i5 using Google Chrome.

## Author ##
[Alberto Vigata](http://vigata.com/about)

## Usage ##
The encoder accepts images in RGBA format which happens to be the format that of the ImageData object used in canvas. 

1) Provide the byte writer object. This is where the compressed data will be written to. There is a default ByteWriter object you can use that writes the result into a memory buffer you can later retrieve.

```javascript
var encoder = new pttJPEG();

// use default byte writer
var bw = new encoder.ByteWriter();

// or roll your own
var myByteWriter = function() {
    // write gets called every time there is data available from the encoder
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
var quality = 50; //a number between 1-99, 1: best compression-worst quality, 99: least compression-best quality

encoder.encode( quality, inImage, bw );
// this encodes the picture and keeps calling your bytewriter when there is data available. On exit
// all data has been written out to the bytewriter
```

There are a couple of samples provided. 
* `sample_html.html` Loads an image from the DOM into a ImageData and encodes it with petitóJPEG. The output is then displayed side by side in the same html as the original.
* `sample_node.js` It's a node.js script that loads a raw image in RGB format from the file system, encodes it with petitóJPEG and outputs the raw jpeg bitstream into a file.

## Usage as a WebWorker ##
petitóJPEG can run as a dedicated web worker. This way the picture processing will not lock up your presentation thread or other operations from the calling thread. Look at the demo directory for an implementation of a web page using web workers.
A message format has been defined for message passing between client-side and the worker.

### From client-side to petitoJPEG web worker ###
```javascript
// Create the worker. Make sure you only create one, otherwise there will be a thread per encode
worker = new Worker("pttjpeg.js");

var m = { 
  'quality' : quality,              // quality desired
  'imageData' : imageData,      // the imageData object
  'width' : width,    // the width of the image
  'height' : height   // the height of the image
};

// Post message to worker
worker.postMessage(m);
```

### Receiving message from petitoJPEG web worker to client-side ###
The received message format is as follows:
```javascript
var m = {
    'url' : url,    // binary data encoded in an url
    'bw' : writtenbytes,  // int with bytes written
    'reason' : 'image',   // the message reason 
    'width' : width,      // the width of pic  
    'height' : height,    // the height of pic
    'quality' : quality,  // the quality used for encode
    'encodetime' : time_in_ms   // the time it took in ms to encode picture
}
```

You have to look into the 'reason' field of the message to see what is being sent back. Look at the code below:
```javascript
worker.onmessage = function(msg) {
    switch(msg.data.reason) {
        case 'image':
            // an image was sent here. url contains the bytes, as well as the other relevant info
            break;
        case 'log':
            // logging from the worker is relied back through this message
            console.log(msg.data.log);
            break;
        default:
            break;
    }
}

```

### Limitations ###
* images are encoded to 4:4:4 chroma sampling only. 4:2:2 and 4:2:0 should be added but it would require chroma plane downsampling making things slower
