function Face(pixelArray) {

    this.pixelArray = pixelArray;

    this.render = function (x, y, w, h) {
        h = h ?? w;
        push();

        translate(x, y);

        noStroke();

        let size = this.pixelArray.length > 192 ? 16 : 8;
        w = w / size;
        h = h / size;
        
        for (var y = 0; y < size; y++) {
            let row = this.pixelArray.substr(y * size * 3, size * 3);
            for (var x = 0; x < size; x++) {
                let colorBytes = row.substr(x * 3, 3);
                let r = colorBytes.charCodeAt(0);
                let g = colorBytes.charCodeAt(1);
                let b = colorBytes.charCodeAt(2);

                fill(r, g, b);
                rect(x * w, y * h, w, h);
            }
        }

        pop();
    }
}