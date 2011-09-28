Basic usage
===========

Have an UL whose list items contain IMG elements with the icons you want on the menu:

```
<ul id="piemenu">
  <li id="entry-1"><img src="icons/item1.png"></li>
  <li id="entry-2"><img src="icons/item2.png"></li>
  <li id="entry-3"><img src="icons/item3.png"></li>
  <li id="entry-4"><img src="icons/item4.png"></li>
</ul>
```

Then, when the pie menu should pop up, use:

```
$('#piemenu').pieMenu({top: 200, left: 400},
                      {onSelection: function(selectedElt) { alert(selectedElt.attr('id'); }});
```

As you might have guessed, the first object is a position spec for where the pie menu should  up: coordinates specify the center of the radial menu, so if you use the current mouse coords,
the "close" area is placed below the pointer.

Options
=======

 - onSelection: a callback function that is passed the selected LI element.

### Style
 - selectedColor: CSS color spec string for the color of the currently highlighted element.
 - backgroundColor: CSS color spec string for the slice/center circle backgrounds.
 - globalAlpha: a float number specifying the menu's opacity.

### CSS
 - className: The new <canvas> element's .className.
 - elementStyle: A property list passed to new <canvas> element's .css jQuery method.

### Radial menu proportions
 - closeRadius: Size of the center "X" circle
 - closePadding: Number of pixels that the choice slices are offset from the "close" circle.
 - closeSymbolSize: radius of the "X" lines of the close symbol
 - outerPadding: number of pixels that are added to the radius of the choice slices.

IE compatibility
================

I've tested this with excanvas.js on IE7 and IE8. Both work, as should IE6. See the [excanvas site](http://excanvas.sourceforge.net/) for details on integrating it in your project.