var convert = require('color-convert');

export function pixelixeImage(image, targetWidth, targetHeight, xOffset, yOffset, sourceWidth, sourceHeight) {
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

    for (var i = 0; i < targetWidth; ++i) {
        for (var j = 0; j < targetHeight; ++j) {

            var redSums = [], greenSums = [], blueSums = [];
            for (var k = 0 ; k < 4; ++k) {
                // sum the squares of each component
                var redSum = 0, greenSum = 0, blueSum = 0;
                for (var x = 0; x < sizeToAverage / 2; x++)
                {
                    for (var y = 0; y < sizeToAverage / 2; y++)
                    {
                        var posX = (k % 2) * sizeToAverage / 2 + x;
                        var posY = Math.floor(k/2) * sizeToAverage / 2 + y;
                        var innerPos = (j * sizeToAverage + posY) * stride + ((i * sizeToAverage) + posX) * channels;
                        redSum += data[innerPos] * data[innerPos];
                        greenSum += data[innerPos + 1] * data[innerPos + 1];
                        blueSum += data[innerPos + 2] * data[innerPos + 2];
                    }
                }

                redSums.push(redSum);
                greenSums.push(greenSum);
                blueSums.push(blueSum);
            }

           
            var hslValues = [];
            var minValue = 1000;
            var minIndex = -1;
            var maxValue = -1;
            var maxIndex = -1;
            for (var k = 0; k < 4; k++) {
                var redSum = Math.sqrt(redSums[k] / (avgBase / 4));
                var greenSum = Math.sqrt(greenSums[k] / (avgBase / 4));
                var blueSum = Math.sqrt(blueSums[k] / (avgBase / 4));

                hslValues.push(convert.rgb.hsl(redSum, greenSum, blueSum));

                if (hslValues[k][0] < minValue) {
                    minValue = hslValues[k][0];
                    minIndex = k;
                }

                if (hslValues[k][0] > maxValue) {
                    maxValue = hslValues[k][0];
                    maxIndex = k;
                }
            }

            var distanceFromMin = 0;
            var distanceFromMax = 0;
            for (var k = 0; k < 4; k++) {
                var hueVal = hslValues[k][0];
                distanceFromMin += Math.abs(hueVal - minValue);
                distanceFromMax += Math.abs(hueVal - maxValue);
            }

            var finalRgb = {
                r: Math.sqrt(redSums.reduce((a, b) => a + b, 0) / avgBase),
                g: Math.sqrt(greenSums.reduce((a, b) => a + b, 0) / avgBase),
                b: Math.sqrt(blueSums.reduce((a, b) => a + b, 0) / avgBase),
                a: 255
            };

            var extremeIndex = (distanceFromMin > distanceFromMax) ? minIndex : maxIndex;
            var extremeRgb = {
                r: Math.sqrt(redSums[extremeIndex] / (avgBase / 4)),
                g: Math.sqrt(greenSums[extremeIndex] / (avgBase / 4)),
                b: Math.sqrt(blueSums[extremeIndex] / (avgBase / 4)),
                a: 255
            };

            var commonRgb = {
                r: Math.sqrt((redSums.reduce((a, b) => a + b, 0) - redSums[extremeIndex]) / (avgBase * 3 / 4)),
                g: Math.sqrt((greenSums.reduce((a, b) => a + b, 0) - greenSums[extremeIndex]) / (avgBase * 3 / 4)),
                b: Math.sqrt((blueSums.reduce((a, b) => a + b, 0) - blueSums[extremeIndex]) / (avgBase * 3 / 4)),
                a: 255
            };

            result.push({
                x: i,
                y: j,
                color: finalRgb,
                extremeColor: extremeRgb,
                commonColor: commonRgb,
            });
        }
    }

    console.log("done pixelizing");
    return {
        pixels: result,
        widthPercentage: sizeToAverage * targetWidth / image.width,
        heightPercentage: sizeToAverage * targetHeight / image.height,
    };
}