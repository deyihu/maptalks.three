/* eslint-disable quotes */
/* eslint-disable indent */
// import { StyleGlyph } from "./AlphaImage";

// The position of a glyph relative to the text's anchor point.
// export type PositionedGlyph = {
//   glyph: number, // charCode
//   x: number,
//   y: number,
//   vertical: boolean,
//   scale: number, // 根据缩放等级计算的缩放比例
//   fontStack: string
// };

// A collection of positioned glyphs and some metadata
// export type Shaping = {
//   positionedGlyphs: Array<PositionedGlyph>, // 每个字符到锚点的位置信息
//   top: number,
//   bottom: number,
//   left: number,
//   right: number,
//   writingMode: 1 | 2,
//   lineCount: number,
//   text: string // 原始文本
// };

// export type SymbolAnchor = 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
// export type TextJustify = 'left' | 'center' | 'right';

function getAnchorAlignment(anchor) {
    let horizontalAlign = 0.5,
        verticalAlign = 0.5;

    switch (anchor) {
        case "right":
        case "top-right":
        case "bottom-right":
            horizontalAlign = 1;
            break;
        case "left":
        case "top-left":
        case "bottom-left":
            horizontalAlign = 0;
            break;
    }

    switch (anchor) {
        case "bottom":
        case "bottom-right":
        case "bottom-left":
            verticalAlign = 1;
            break;
        case "top":
        case "top-right":
        case "top-left":
            verticalAlign = 0;
            break;
    }

    return { horizontalAlign, verticalAlign };
}

// justify right = 1, left = 0, center = 0.5
function justifyLine(positionedGlyphs, glyphMap, start, end, justify) {
    if (!justify) return;

    const lastPositionedGlyph = positionedGlyphs[end];
    const positions = glyphMap[lastPositionedGlyph.fontStack];
    const glyph = positions && positions[lastPositionedGlyph.glyph];
    if (glyph) {
        const lastAdvance = glyph.metrics.advance * lastPositionedGlyph.scale;
        const lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;

        for (let j = start; j <= end; j++) {
            positionedGlyphs[j].x -= lineIndent;
        }
    }
}

// justify right=1 left=0 center=0.5
// horizontalAlign right=1 left=0 center=0.5
// verticalAlign right=1 left=0 center=0.5
function align(
    positionedGlyphs,
    justify,
    horizontalAlign,
    verticalAlign,
    maxLineLength,
    lineHeight,
    lineCount
) {
    const shiftX = (justify - horizontalAlign) * maxLineLength;
    const shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight;

    for (let j = 0; j < positionedGlyphs.length; j++) {
        positionedGlyphs[j].x += shiftX;
        positionedGlyphs[j].y += shiftY;
    }
}

function shapeLines(
    shaping,
    glyphMap,
    lines,
    lineHeight,
    textAnchor,
    textJustify,
    writingMode,
    spacing,
    fontStack
) {
    // the y offset *should* be part of the font metadata
    const yOffset = -17;

    let x = 0;
    let y = yOffset;

    let maxLineLength = 0;
    const positionedGlyphs = shaping.positionedGlyphs;

    const justify =
        textJustify === "right" ? 1 : textJustify === "left" ? 0 : 0.5;

    const lineStartIndex = positionedGlyphs.length;
    lines.forEach((line) => {
        line.split("").forEach((char) => {
            // fontStack
            const positions = glyphMap[fontStack];
            const charCode = char.charCodeAt(0);
            const glyph = positions && positions[charCode];
            // const baselineOffset = (lineMaxScale - section.scale) * 24;
            const baselineOffset = 0;

            if (glyph) {
                positionedGlyphs.push({
                    glyph: charCode,
                    x,
                    y: y + baselineOffset,
                    vertical: false,
                    scale: 1,
                    fontStack,
                });
                x += glyph.metrics.advance + spacing;
            }
        });

        // 左右对齐
        if (positionedGlyphs.length !== lineStartIndex) {
            const lineLength = x - spacing;
            maxLineLength = Math.max(lineLength, maxLineLength);
            justifyLine(
                positionedGlyphs,
                glyphMap,
                lineStartIndex,
                positionedGlyphs.length - 1,
                justify
            );
        }

        x = 0;
        y += lineHeight;
    });

    const { horizontalAlign, verticalAlign } = getAnchorAlignment(textAnchor);
    align(
        positionedGlyphs,
        justify,
        horizontalAlign,
        verticalAlign,
        maxLineLength,
        lineHeight,
        lines.length
    );

    // 计算包围盒
    const height = y - yOffset;

    shaping.top += -verticalAlign * height;
    shaping.bottom = shaping.top + height;
    shaping.left += -horizontalAlign * maxLineLength;
    shaping.right = shaping.left + maxLineLength;
}

export function shapeText(
    text,
    glyphs,
    defaultFontStack,
    maxWidth,
    lineHeight,
    textAnchor,
    textJustify,
    spacing,
    translate,
    writingMode
) {
    // TODO：处理换行
    const lines = text.split("\n");

    const positionedGlyphs = [];
    const shaping = {
        positionedGlyphs,
        text,
        top: translate[1],
        bottom: translate[1],
        left: translate[0],
        right: translate[0],
        writingMode,
        lineCount: lines.length,
    };

    shapeLines(
        shaping,
        glyphs,
        lines,
        lineHeight,
        textAnchor,
        textJustify,
        writingMode,
        spacing,
        defaultFontStack
    );
    if (!positionedGlyphs.length) return false;

    return shaping;
}
