const Jimp = require('jimp');
const fs = require('fs');
const Packet = require('../network/packet');
const converter = require('hex2dec');
const logger = require('./logger');

const Skin = {

    onPlayerJoin: (pk, ws) => {
        if (pk.body.skinData) {
            try {
                Skin.toImage(pk.body.skinData, true, (img) => {
                    img.writeAsync('skins/' + pk.body.name + '.png').then(() => {
                        logger.info('Skin for ' + pk.body.name + ' was generated and saved');
                    });
                });
            } catch(e) {
                logger.error('Failed to generate skin image for ' + pk.body.name);
                logger.error(e);
            }
        }
    },

    toImage: (skinData, base64 = false, cb = null) => {
        if (base64) {
            skinData = atob(skinData);
        }

        try {
            var jimpImage = new Jimp(64, 64, function (err, image) {
                if (err) throw err;

                let pixelArray = chunk(bin2hex(skinData), 8);

                for (let position = pixelArray.length - 1; position >= 0; position--) {
                    let x = position % 64;
                    let y = (position - x) / 64;
                    let color = string_chop(pixelArray.pop(), 2).map((value) => {
                        return converter.hexToDec(value);
                    });
                    let alpha = color.pop();
                    alpha = ((~(parseInt(alpha))) & 0xff) >> 1;
                    let decColor = parseInt(converter.hexToDec(color.join('')));
                    image.setPixelColor(Math.max(0, Math.min(decColor, 4294967295)), x, y);
                }

                if(cb) cb(image);
            });
        } catch (error) {
            throw 'error rendering skin';
        }

        return jimpImage;
    },

}

function bin2hex(s) {
    let i
    let l
    let o = ''
    let n
    s += ''
    for (i = 0, l = s.length; i < l; i++) {
        n = s.charCodeAt(i)
            .toString(16)
        o += n.length < 2 ? '0' + n : n
    }
    return o
}

function chunk(array, size) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}

function string_chop(str, size) {
    if (str == null) return [];
    str = String(str);
    size = ~~size;
    return size > 0 ? str.match(new RegExp('.{1,' + size + '}', 'g')) : [str];
}

// Packet.PlayerJoin.listeners.push(Skin.onPlayerJoin);

module.exports = Skin;