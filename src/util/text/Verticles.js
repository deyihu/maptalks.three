export function pages(glyphs) {
    var pages = new Float32Array(glyphs.length * 4 * 1);
    var i = 0;
    glyphs.forEach(function (glyph) {
        var id = glyph.data.page || 0;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
    });
    return pages;
}

export function uvs(glyphs, texWidth, texHeight, flipY) {
    var uvs = new Float32Array(glyphs.length * 4 * 2);
    var i = 0;
    glyphs.forEach(function (glyph) {
        var bitmap = glyph.data;
        var bw = (bitmap.x + bitmap.width);
        var bh = (bitmap.y + bitmap.height);

        // top left position
        var u0 = bitmap.x / texWidth;
        var v1 = bitmap.y / texHeight;
        var u1 = bw / texWidth;
        var v0 = bh / texHeight;

        if (flipY) {
            v1 = (texHeight - bitmap.y) / texHeight;
            v0 = (texHeight - bh) / texHeight;
        }

        // BL
        uvs[i++] = u0;
        uvs[i++] = v1;
        // TL
        uvs[i++] = u0;
        uvs[i++] = v0;
        // TR
        uvs[i++] = u1;
        uvs[i++] = v0;
        // BR
        uvs[i++] = u1;
        uvs[i++] = v1;
    });
    return uvs;
}

export function positions(glyphs) {
    var positions = new Float32Array(glyphs.length * 4 * 2);
    var i = 0;
    glyphs.forEach(function (glyph) {
        var bitmap = glyph.data;

        // bottom left position
        var x = glyph.position[0] + bitmap.xoffset;
        var y = glyph.position[1] + bitmap.yoffset;

        // quad size
        var w = bitmap.width;
        var h = bitmap.height;

        // BL
        positions[i++] = x;
        positions[i++] = y;
        // TL
        positions[i++] = x;
        positions[i++] = y + h;
        // TR
        positions[i++] = x + w;
        positions[i++] = y + h;
        // BR
        positions[i++] = x + w;
        positions[i++] = y;
    });
    return positions;
}

var itemSize = 2;
var box = { min: [0, 0], max: [0, 0] };

function bounds(positions) {
    var count = positions.length / itemSize;
    box.min[0] = positions[0];
    box.min[1] = positions[1];
    box.max[0] = positions[0];
    box.max[1] = positions[1];

    for (var i = 0; i < count; i++) {
        var x = positions[i * itemSize + 0];
        var y = positions[i * itemSize + 1];
        box.min[0] = Math.min(x, box.min[0]);
        box.min[1] = Math.min(y, box.min[1]);
        box.max[0] = Math.max(x, box.max[0]);
        box.max[1] = Math.max(y, box.max[1]);
    }
}

export function computeBox(positions, output) {
    bounds(positions);
    output.min.set(box.min[0], box.min[1], 0);
    output.max.set(box.max[0], box.max[1], 0);
}

export function computeSphere(positions, output) {
    bounds(positions);
    var minX = box.min[0];
    var minY = box.min[1];
    var maxX = box.max[0];
    var maxY = box.max[1];
    var width = maxX - minX;
    var height = maxY - minY;
    var length = Math.sqrt(width * width + height * height);
    output.center.set(minX + width / 2, minY + height / 2, 0);
    output.radius = length / 2;
}

