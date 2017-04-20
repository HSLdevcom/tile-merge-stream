tile-merge-stream
====================

Transform stream for creating composite images from smaller tiles. Takes in a stream of objects containing tiles as raw buffers and transforms them into a single pixel stream.

### Usage

```javascript
const fs = require("fs");
const PNGEncoder = require("png-stream").Encoder;
const TileMergeStream = require("tile-merge-stream");

const stream = new TileMergeStream({ width: 1000, height: 1000, channels: 3 });

stream
    .pipe(new PNGEncoder(1000, 1000, { colorSpace: "rgb" }))
    .pipe(fs.createWriteStream("output.png"));

[0, 50, 100, 150].forEach((color) => {
    stream.write({
        data: Buffer.alloc(500 * 500 * 3, color),
        width: 500,
        height: 500
     });
})

stream.end();
```
