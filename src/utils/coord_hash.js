module.exports = function coord_hash(sectorCoordinateArray) {
    return sectorCoordinateArray[0] + ':' + sectorCoordinateArray[1];
}