/* @@--
 * Copyright (C) 2014 Alberto Vigata
 * All rights reserved
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met
 * 
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the University of California, Berkeley nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE REGENTS AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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

