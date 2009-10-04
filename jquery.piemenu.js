/* Radial pie menu implementation using jQuery and <canvas>.
 *
 * Copyright (c) 2009 Andreas Fuchs <asf@boinkor.net>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/* See README.markdown for usage info. */

(function($) {
     var defaults = {
         closeRadius: 20,
         closePadding: 3,
         closeSymbolSize: 7,
         outerPadding: 10,
         globalAlpha: 0.9,
         onSelection: function() {},
         className: null,
         elementStyle: null,
         selectedColor: 'red',
         backgroundColor: 'blue',
         parentElement: 'body'
     },

     innerSegmentAngle = function(n) {
         return paddedSegmentAngle(n) - (Math.PI/180)*4;
     },

     paddedSegmentAngle = function(n) {
         return 2*Math.PI / n;
     },

     startAngle = function (n, total) {
         return (-Math.PI/2) + paddedSegmentAngle(total) * n;
     },

    endAngle = function(n, total) {
        return startAngle(n, total) + innerSegmentAngle(total);
    };

     var minRadius = function(menu, options) {
         var diagonal = 0, maxside = 0;
         $('img', menu).each(
             function(_, img) {
                 var w = $(img).width(), h = $(img).height();
                 diagonal = Math.max(diagonal, Math.sqrt(w*w + h*h));
                 maxside = Math.max(maxside, w, h);
             });
         var segmentAngle = paddedSegmentAngle($('img', menu).length);
         var dHalved = diagonal/2, alpha = (Math.PI - segmentAngle) / 2;
         return Math.ceil(dHalved * Math.sin(alpha) +
                          Math.max(dHalved, maxside) + options.outerPadding);

     };

     var setSelectedColor = function(ctx, isSelected, options) {
         ctx.fillStyle = (isSelected ? options.selectedColor : options.backgroundColor);
     };

     $.fn.pieMenu = function (position, options) {
         $.each(defaults,
                function(defaultName, value) {
                    if (!(defaultName in options))
                        options[defaultName] = value;
                });
         var canvas = document.createElement('canvas'),
         highlight = 'x',
         menu = $(this).get(0),
         nSegments = $('img', menu).length,
         radius = minRadius(menu, options) + options.closeRadius + options.closePadding;

         canvas.setAttribute('width', radius*2);
         canvas.setAttribute('height', radius*2);
         if (options.className)
             canvas.className = options.className;
         if (options.elementStyle)
             $(canvas).css(options.elementStyle);
         $(canvas).css(
             {
                 top: position.top - radius,
                 left: position.left - radius
             });

         $(options.parentElement).append($(canvas));
         if (window.G_vmlCanvasManager) {
             // We're on IE, need to initialize the new canvas.
             window.G_vmlCanvasManager.initElement(canvas);
             canvas.unselectable = 'on';   // Make sure mouse clicks go through.
         }
         var draw = function() {
             var ctx = canvas.getContext('2d');
             ctx.globalAlpha = options.globalAlpha;
             ctx.strokeStyle = 'black';
             ctx.fillStyle = options.backgroundColor;
             ctx.lineCap = 'butt';
             ctx.lineJoin = 'round';
             ctx.lineWidth = 2;

             ctx.clearRect(0, 0, canvas.width, canvas.height);
             // Draw segments
             $('img', menu).each(
                 function(i, elt) {
                     setSelectedColor(ctx, i === highlight, options);
                     drawSlice(ctx, radius, i, nSegments, elt);
                 });

             // Draw center "X"
             ctx.beginPath();
             setSelectedColor(ctx, highlight === 'x', options);
             ctx.arc(radius, radius, options.closeRadius, 0, Math.PI*2, false);
             ctx.fill();

             ctx.beginPath();
             ctx.lineCap = 'round';
             ctx.strokeStyle = 'white';
             ctx.lineWidth = 4;
             ctx.moveTo(radius - options.closeSymbolSize, radius - options.closeSymbolSize);
             ctx.lineTo(radius + options.closeSymbolSize, radius + options.closeSymbolSize);
             ctx.stroke();
             ctx.moveTo(radius - options.closeSymbolSize, radius + options.closeSymbolSize);
             ctx.lineTo(radius + options.closeSymbolSize, radius - options.closeSymbolSize);
             ctx.stroke();
         },
         destroy = function() {
             $(canvas).remove();
         },
         onClick = function(e){
             if (highlight >= 0 && highlight < nSegments) {
                 var highlightElt = $('img', menu).get(highlight);
                 if (e.data)
                     e.data($(highlightElt).parent('li'));
             }
             destroy();
         },
         changeHighlight = function(e) {
             var prevHighlight = highlight;
             var posn = $(canvas).offset();
             var x = e.pageX - posn.left, y = e.pageY - posn.top;
             var cX = canvas.width/2, cY = canvas.height/2;
             var centerDistance = Math.sqrt((cX - x)*(cX - x) + (cY - y)*(cY - y));
             if (centerDistance < options.closeRadius) {
                 highlight = 'x';
                 if (highlight != prevHighlight)
                     draw();
             } else if (centerDistance > options.closeRadius + options.closePadding) {
                 var dX = x - cX, dY = y - cY;
                 var angle = null;
                 if (dX < 0)
                     angle = Math.PI + Math.asin(-dY/centerDistance);
                 else
                     angle = Math.asin(dY/centerDistance);

                 $('img', menu).each(
                     function(i, img) {
                         if (startAngle(i, nSegments) < angle &&
                             endAngle(i, nSegments) >= angle) {
                             highlight = i;
                             return false;
                         }
                         return true;
                     });
                 if (highlight != prevHighlight)
                     draw();
             }
         },
         drawSlice = function(ctx, radius, n, total, img) {
             var startA = startAngle(n, total), endA = endAngle(n, total);

             ctx.beginPath();
             ctx.arc(radius, radius, options.closeRadius + options.closePadding,
                     startA, endA, false);
             ctx.arc(radius, radius, radius, endA, startA, true);
             ctx.closePath();
             ctx.fill();

             var iconW = $(img).width(), iconH = $(img).height();
             var iconCenterRadius = radius - Math.max(iconW, iconH)/2-options.outerPadding;
             var midAngle = startA + (endA - startA)/2,
             iconX = Math.cos(midAngle) * iconCenterRadius,
             iconY = Math.sin(midAngle) * iconCenterRadius;
             ctx.drawImage(img, radius + iconX-(iconW/2), radius + iconY-iconH/2);
         };

         $(canvas).
             mousemove(changeHighlight).
             mouseleave(function(e){
                            highlight = null;
                            draw();
                        }).
             bind('click', options.onSelection, onClick);
         draw();
     };
 }(jQuery));
