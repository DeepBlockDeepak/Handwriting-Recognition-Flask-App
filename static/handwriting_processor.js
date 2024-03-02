var mousePressed = false;
var lastX, lastY;
var ctx, ctx2, ctx3, ctx4;

function InitThis() {
    var canvasIds = ['myCanvas', 'myCanvas2', 'myCanvas3', 'myCanvas4'];
    var contexts = []; // Temporary array to hold the contexts

    canvasIds.forEach(function(canvasId, index) {
        var ctx = document.getElementById(canvasId).getContext("2d");
        contexts.push(ctx); // Add the context to the array

        $('#' + canvasId).mousedown(function(e) {
            mousePressed = true;
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false, ctx);
        });

        $('#' + canvasId).mousemove(function(e) {
            if (mousePressed) {
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true, ctx);
            }
        });

        $('#' + canvasId).mouseup(function() {
            mousePressed = false;
        });

        $('#' + canvasId).mouseleave(function() {
            mousePressed = false;
        });
    });

    // Now assign the contexts to the global variables
    [ctx, ctx2, ctx3, ctx4] = contexts;
}

function Draw(x, y, isDown, ctx) {
    if (isDown) {
        ctx.beginPath();
        ctx.strokeStyle = $('#selColor').val();
        ctx.lineWidth = $('#selWidth').val();
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x; lastY = y;
}

function clearArea() {
    var canvasIds = ['myCanvas', 'myCanvas2', 'myCanvas3', 'myCanvas4'];
    canvasIds.forEach(function(canvasId) {
        var ctx = document.getElementById(canvasId).getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
}


function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}


// Refactored function to process and display image data
function processAndDisplayImageData(ctx, displayElementId) {
    var imageData = ctx.getImageData(0, 0, 80, 80);
    var data = imageData.data;
  
    // Convert to grayscale
    for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
     
    var first_digit = [];
    for (var y = 0; y < data.length; y+=4) {
        first_digit.push(data[y])
    }
 
    var compress = []
    var sum = 0;
    
    for (var z = 0; z < first_digit.length; z++) {
        sum = sum + first_digit[z];
        if (z % 100 === 0) {
            compress.push(sum/100);
            sum = 0;   
        }
    };

    squares = []
    for(var i = 0; i < 64; i++){
        squares.push([]);
    }

    for(var y = 0; y < 80; y++) {
        for(var x = 0; x < 80; x++) {
            squares[parseInt(y/10) * 8 + parseInt(x/10)].push(first_digit[x + y * 80])
        }
    }
  
    
    var compressed = []; 
    squares.forEach(function(square){
        compressed.push(average(square)/16)
    })

    
    // round
    for (var k = 0; k < compress.length; k++) {
        compressed[k] = compressed[k].toFixed(2);
    }
  
    // Conditional display logic based on displayElementId
    // if (displayElementId === "display4") {
    //     // special print for display4
    //     document.getElementById('display4').innerHTML = "[" + compressed + "]";
    // } else {
    //     // all other cases
    //     document.getElementById(displayElementId).innerHTML = "[" + compressed + "]" + ",";
    // }

    return compressed;
}

function sendCompressedData(compressedData) {
    console.log('Sending data to server:', JSON.stringify(compressedData));
    fetch('/process_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({data: compressedData}),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Prediction from server:', data);
        // Update the UI with the prediction results
        document.getElementById('prediction').innerText = data.prediction.join(", ");
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('prediction').innerText = "Failed to send data.";
    });
}


function array() {
    // document.getElementById('opening_bracket').innerHTML = "[";
  
    var contexts = [ctx, ctx2, ctx3, ctx4];
    var displayIds = ['display', 'display2', 'display3', 'display4'];
    var allCompressedData = [];
  
    // Loop through each canvas/context
    for (var i = 0; i < contexts.length; i++) {
        var compressedData = processAndDisplayImageData(contexts[i], displayIds[i]);
        allCompressedData.push(compressedData);
    }

    // document.getElementById('closing_bracket').innerHTML = "]"
    
    sendCompressedData(allCompressedData);
}
