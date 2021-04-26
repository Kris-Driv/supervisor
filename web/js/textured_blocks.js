function TexturedBlockPainter() {

    this.flatPainter = new FlatColorBlockPainter();

    loadJSON('/assets/textures.json', (json) => {
        this.textureMap = json;
        loadImage('/assets/textures.png', (img) => {
            this.textureAtlas = img;
        });
    });
    
    this.fallbackBlock = {
        "x": 0,
        "y": 0,
        "name": "Fallback Block"
    }

    this.rotations = [
        0, 90, 180, 270
    ];

    this.halfBlock = floor(RenderSettings.BLOCK_RESOLUTION / 2);

    this.paint = function(buffer, x, y, z, blockId) {
        let block = this.getBlock(blockId);

        buffer.push();
        buffer.translate(x + this.halfBlock, z + this.halfBlock);

        buffer.rotate(radians(this.rotations[round(random(0, 3))]));
        buffer.image(
            this.textureAtlas, // Textures
            -this.halfBlock, -this.halfBlock, // Position on target
            RenderSettings.BLOCK_RESOLUTION, RenderSettings.BLOCK_RESOLUTION, // Target size
            block.x * this.textureMap.size, block.y * this.textureMap.size, // Source position
            this.textureMap.size, this.textureMap.size // source size
        );
        buffer.pop();

        this.flatPainter.shadeForDepth(buffer, x, y, z, blockId);
    }

    this.getBlock = function(blockId) {
        return this.textureMap.blocks[blockId] ?? this.fallbackBlock;
    }

}