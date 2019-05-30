import { max } from "gl-matrix/cjs/vec2";
import { min } from "gl-matrix/cjs/vec3";

export function pixelixeImage(image, targetWidth, targetHeight) {
    var width = image.width;
    var height = image.height;

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    // Get raw image data
    var data = context.getImageData(0, 0, width, height).data;

    var numDivisions = 0;
    while (width / 2 >= targetWidth && height / 2 > targetHeight) {
        width /= 2;
        height /= 2;
        numDivisions++;
    }

    const sizeToAverage = 1 << numDivisions;
    const avgBase = sizeToAverage * sizeToAverage;
    const channels = 4; // rgba
    const stride = channels * image.width;

    var result = [];

    for (var i = 0; i < 28; ++i) {
        for (var j = 0; j < 22; ++j) {
            // sum the squares of each component
            var redSum = 0, greenSum = 0, blueSum = 0;
            for (var x = 0; x < sizeToAverage; x++)
            {
                for (var y = 0; y < sizeToAverage; y++)
                {
                    var innerPos = (j * sizeToAverage + y) * stride + ((i * sizeToAverage) + x) * channels;
                    redSum += data[innerPos] * data[innerPos];
                    greenSum += data[innerPos + 1] * data[innerPos + 1];
                    blueSum += data[innerPos + 2] * data[innerPos + 2];
                }
            }

            result.push({
                x: i,
                y: j,
                color: {
                    r: Math.sqrt(redSum / avgBase),
                    g: Math.sqrt(greenSum / avgBase),
                    b: Math.sqrt(blueSum / avgBase),
                    a: 255
                },
            });
        }
    }

    console.log("done pixelizing");
    return result;
}