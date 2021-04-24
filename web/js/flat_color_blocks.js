function FlatColorBlockPainter() {

    this.paint = function(buffer, x, y, blockId) {
        let blockColor = this.getBlockColor(blockId);

        buffer.fill(blockColor);
        buffer.rect(x, y, 1);
    }

    this.blockColorMap = {
        // Grass
        // '2': '#00b894',
        // Snow
        '78': '#dfe6e9',
        // Stone
        '1': '#636e72',
        // Some plants
        // '31': '#78e08f',
        // Oak leaves
        '18': '#009432',
        // Water
        '9': '#0652DD',
        // Sand
        '12': '#ffeaa7',
        // Dead bush
        //'31': '#cc8e35',
        // Dirt
        '3': '#f0932b',
        // Pink clay
        '159': '#edcecc',
        // Poppy
        //'38': '#8a140c',
        // Brown mushroom
        //'39': '#cc8d60',
        // Sunflower
        //'175': '#ffe100',
        // Hardened Clay
        '172': '#c97947',
        // Acacia leaves
        '161': '#78e08f',
        // Ice
        '79': '#74b9ff',
        // Packed ice (darker?)
        '174': '#0984e3',
    },

    // Grass color
    this.fallbackBlockColor = this.blockColorMap['2'],

    this.getBlockColor = function(blockId) {
        return this.blockColorMap[blockId] ?? ((id) => {
            // console.log('unknown block ' + id);
            return this.fallbackBlockColor;

        })(blockId);
    }

}