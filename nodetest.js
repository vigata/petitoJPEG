var ptt = require('./pttjpeg.js');
var fs = require('fs');


// function to convert from RGB to RGBA
function convert(inbuf, out, w, h) {
    out.width = w;
    out.height = h;
    var arr = new Uint8Array(w*h*4);
    out.data = arr;

    for(var i=0; i<w*h; i++) {
        arr[i*4] = inbuf[i*3];
        arr[i*4+1] = inbuf[i*3+1];
        arr[i*4+2] = inbuf[i*3+2];
    }
};

// read from sample image into a ImageDataObject
var inImgData = new Object();
var iw = 512  ,ih= 512  ;
var inrgb = fs.readFileSync('img/in_'+iw+'_'+ih +'_RGB.data');
convert(inrgb, inImgData, iw, ih);


var encoder = new ptt.pttJPEG();
console.log(encoder.version());

var inImg = new encoder.pttImage( inImgData );

// our bytewriter writes to an out.jpg file in the same
// directory as the script
var bw = new (function() {
            var bufsize = 512;
            var buf = new Buffer(bufsize);
            var fd = fs.openSync("out.jpg","w");
            // writes count bytes starting at start position from array
            // array is Uint8Array()
            this.write = function( array, start, count ){
                while(count>0) {
                    var wb = count > bufsize ? bufsize : count;
                    // copy bytes
                    for(var i=0; i<wb; i++) {
                        buf[i] = array[start+i];
                    }

                    fs.writeSync(fd, buf,0, wb, null);
                    start += wb;
                    count -= wb;
                }
            };

            this.close = function() {
                fs.closeSync(fd);
            }
        });


// encode
encoder.encode(90, inImg, bw);

// close file
bw.close();

