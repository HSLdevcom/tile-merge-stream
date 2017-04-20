var Transform = require("readable-stream/transform");

class TileMergeStream extends Transform {
    constructor(options) {
        if (!options || !options.width || !options.height | !options.channels) {
            throw new Error("Invalid options; Width, height and channels are required");
        }
        super({ objectMode: true });
        this.options = options;
        this.offset = 0;
    }

    _transform(tile, encoding, callback) {
        const { width, height, channels } = this.options;

        if (tile.width > width - this.offset) {
            callback(new Error("Tile width exceeds remaining space in row"));
            return;
        }
        if (this.buffer && tile.height !== this.buffer.height) {
            callback(new Error("Tile height does not match height of previous tile(s) in row"));
            return;
        }
        if (this.offset === 0) {
            this.buffer = {
                width,
                height: tile.height,
                data: Buffer.alloc(width * tile.height * channels),
            };
        }

        let tileIndex = 0;
        let tileLength = tile.width * tile.height * channels;
        let bufferIndex = this.offset * channels;

        while (tileIndex < tileLength) {
            tile.data.copy(this.buffer.data, bufferIndex, tileIndex, tileIndex + (tile.width * channels));
            bufferIndex += width * channels;
            tileIndex += tile.width * channels;
        }

        this.offset = this.offset + tile.width;
        if (this.offset === width) {
            this.push(this.buffer.data);
            this.buffer = null;
            this.offset = 0;
        }

        callback();
    }

    _flush(callback) {
        this.buffer = null;
        callback();
    }
}

module.exports = TileMergeStream;
